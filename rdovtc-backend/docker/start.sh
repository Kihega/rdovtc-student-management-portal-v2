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

echo "OK: ENV check passed (JWT_SECRET is ${#JWT_SECRET} chars)"

# ── Storage dirs ──────────────────────────────────────────────────────────────
mkdir -p storage/framework/cache/data storage/framework/sessions \
         storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# ── Wait for PostgreSQL ───────────────────────────────────────────────────────
echo "Waiting for PostgreSQL..."
_attempts=0; _max=40

until php -r "
    \$url   = preg_replace('#^postgres://#','pgsql://',getenv('DATABASE_URL'));
    \$parts = parse_url(\$url);
    \$dsn   = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
        \$parts['host'],\$parts['port']??5432,ltrim(\$parts['path'],'/'));
    try { new PDO(\$dsn,\$parts['user'],\$parts['pass'],[PDO::ATTR_TIMEOUT=>3]); exit(0); }
    catch(Exception \$e){ exit(1); }
" 2>/dev/null; do
    _attempts=$((_attempts+1))
    [ "$_attempts" -ge "$_max" ] && echo "ERROR: DB not ready after $((_max*5))s" && exit 1
    echo "  DB not ready — attempt ${_attempts}/${_max}, retrying in 5s..."
    sleep 5
done
echo "OK: PostgreSQL ready"

# ── Clear ALL stale cache (removes any old config with wrong JWT_SECRET) ───────
echo "Clearing stale cache..."
php artisan config:clear 2>/dev/null || true
php artisan route:clear  2>/dev/null || true
php artisan view:clear   2>/dev/null || true
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
echo "OK: Seeded — login with:"
echo "   admin@rdovtc.com     / Admin@2025      (Admin)"
echo "   director@rdovtc.com  / Director@2025   (Executive director)"
echo "   vet@rdovtc.com       / Vet@2025         (VET Coordinator)"
echo "   principal@rdovtc.com / Principal@2025   (Principal/TC)"

# ── Rebuild cache fresh ───────────────────────────────────────────────────────
echo "Rebuilding cache..."
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
