#!/bin/sh
set -e

echo "=== RDO VTC Backend — Starting ==="
cd /var/www/html

# ── Validate env vars ─────────────────────────────────────────────────────────
missing=""
[ -z "$APP_KEY"      ] && missing="$missing APP_KEY"
[ -z "$JWT_SECRET"   ] && missing="$missing JWT_SECRET"
[ -z "$DATABASE_URL" ] && missing="$missing DATABASE_URL"

if [ -n "$missing" ]; then
    echo "ERROR: Missing required env vars:$missing"
    echo "  Set them in Render → your service → Environment tab"
    exit 1
fi

echo "OK: ENV vars present (JWT_SECRET length: ${#JWT_SECRET})"

# ── Storage dirs ──────────────────────────────────────────────────────────────
mkdir -p storage/framework/cache/data storage/framework/sessions \
         storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# ── Wait for DB ───────────────────────────────────────────────────────────────
echo "Waiting for PostgreSQL..."
_attempts=0; _max=40

until php -r "
    \$url = getenv('DATABASE_URL');
    \$url   = preg_replace('#^postgres://#','pgsql://',\$url);
    \$parts = parse_url(\$url);
    \$dsn   = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
        \$parts['host'],\$parts['port']??5432,ltrim(\$parts['path'],'/'));
    try { new PDO(\$dsn,\$parts['user'],\$parts['pass'],[PDO::ATTR_TIMEOUT=>3]); exit(0); }
    catch(Exception \$e){ exit(1); }
" 2>/dev/null; do
    _attempts=$((_attempts+1))
    [ "$_attempts" -ge "$_max" ] && echo "ERROR: DB not ready" && exit 1
    echo "  DB not ready — attempt ${_attempts}/${_max}, retrying in 5s..."
    sleep 5
done
echo "OK: PostgreSQL ready"

# ── CRITICAL: Clear ALL cached config first (stale JWT_SECRET etc) ────────────
echo "Clearing stale cache..."
php artisan config:clear  2>/dev/null || true
php artisan route:clear   2>/dev/null || true
php artisan view:clear    2>/dev/null || true
echo "OK: Stale cache cleared"

# ── Migrations ────────────────────────────────────────────────────────────────
echo "Running migrations..."
php artisan migrate --force --no-interaction || {
    echo "Migration failed, retrying in 10s..."
    sleep 10
    php artisan migrate --force --no-interaction
}
echo "OK: Migrations done"

# ── Seed fresh test users ─────────────────────────────────────────────────────
echo "Seeding test users..."
php artisan db:seed --force --no-interaction
echo "OK: Seeded"
echo "   admin@rdovtc.com     / Admin@2025"
echo "   director@rdovtc.com  / Director@2025"
echo "   vet@rdovtc.com       / Vet@2025"
echo "   principal@rdovtc.com / Principal@2025  (VTC-Mdabulo)"

# ── Rebuild cache fresh (picks up current JWT_SECRET from env) ────────────────
echo "Rebuilding cache..."
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

# ── Verify JWT config loaded correctly ────────────────────────────────────────
JWT_LEN=$(php -r "
    require __DIR__.'/bootstrap/app.php';
    \$app = app();
    \$app->make('config');
    echo strlen(config('jwt.secret'));
" 2>/dev/null || echo "0")
echo "JWT secret length in cached config: ${JWT_LEN} chars"
if [ "$JWT_LEN" -lt "10" ] 2>/dev/null; then
    echo "WARNING: JWT secret appears empty in config cache!"
    echo "  JWT_SECRET env = ${#JWT_SECRET} chars"
    echo "  Forcing config:clear and rebuilding without cache..."
    php artisan config:clear
fi

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
