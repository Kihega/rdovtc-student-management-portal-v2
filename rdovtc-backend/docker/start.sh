#!/bin/sh
# RDO VTC Backend — Docker entrypoint (JWT auth, file cache, no Sanctum)
set -e

echo "=== RDO VTC Backend — Starting ==="
cd /var/www/html

# ── Validate critical env vars ────────────────────────────────────────────────
if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY is not set. Add it in Render → Environment Variables."
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET is not set."
    echo "  Go to Render → your service → Environment → Add:"
    echo "  Key: JWT_SECRET"
    echo "  Value: (click Generate to get a random value)"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set."
    echo "  Go to Render → your service → Environment → DATABASE_URL → from database: rdovtc-db"
    exit 1
fi

echo "OK: All required env vars present"

# ── Ensure storage dirs exist (needed for file cache) ─────────────────────────
mkdir -p storage/framework/cache/data storage/framework/sessions \
         storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

# ── Wait for PostgreSQL via PHP PDO ──────────────────────────────────────────
echo "Waiting for PostgreSQL..."
_attempts=0
_max=40

until php -r "
    \$url = getenv('DATABASE_URL');
    if (!empty(\$url)) {
        \$url   = preg_replace('#^postgres://#', 'pgsql://', \$url);
        \$parts = parse_url(\$url);
        \$dsn   = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
            \$parts['host'], \$parts['port'] ?? 5432, ltrim(\$parts['path'], '/'));
        \$u = \$parts['user']; \$p = \$parts['pass'];
    } else {
        \$dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
            getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_PORT') ?: '5432',
            getenv('DB_DATABASE') ?: 'rdovtc', getenv('DB_SSLMODE') ?: 'require');
        \$u = getenv('DB_USERNAME'); \$p = getenv('DB_PASSWORD');
    }
    try { new PDO(\$dsn, \$u, \$p, [PDO::ATTR_TIMEOUT => 3]); exit(0); }
    catch (Exception \$e) { exit(1); }
" 2>/dev/null
do
    _attempts=$((_attempts + 1))
    if [ "$_attempts" -ge "$_max" ]; then
        echo "ERROR: PostgreSQL not ready after $((_max * 5))s."
        echo "  Check DATABASE_URL is linked to rdovtc-db in Render dashboard."
        exit 1
    fi
    echo "  DB not ready — attempt ${_attempts}/${_max}, retrying in 5s..."
    sleep 5
done
echo "OK: PostgreSQL ready"

# ── Migrations ────────────────────────────────────────────────────────────────
echo "Running migrations..."
php artisan migrate --force --no-interaction || {
    echo "Migration failed — retrying in 10s..."
    sleep 10
    php artisan migrate --force --no-interaction
}
echo "OK: Migrations done"

# ── Always seed fresh test users ─────────────────────────────────────────────
echo "Seeding test users (truncates users table for clean start)..."
php artisan db:seed --force --no-interaction
echo "OK: Seeded"
echo "   admin@rdovtc.com     / Admin@2025      (Admin)"
echo "   director@rdovtc.com  / Director@2025   (Executive director)"
echo "   vet@rdovtc.com       / Vet@2025         (VET Coordinator)"
echo "   principal@rdovtc.com / Principal@2025   (Principal/TC → VTC-Mdabulo)"

# ── Cache (file-based, no DB table needed) ────────────────────────────────────
echo "Rebuilding cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
