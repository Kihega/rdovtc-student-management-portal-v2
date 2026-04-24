#!/bin/sh
# RDO VTC Backend — Docker entrypoint
# JWT-based auth: no Sanctum, no personal_access_tokens table needed.
set -e

echo "=== RDO VTC Backend — Starting ==="
cd /var/www/html

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
        exit 1
    fi
    echo "  DB not ready — attempt ${_attempts}/${_max}, retrying in 5s..."
    sleep 5
done
echo "OK: PostgreSQL ready"

# ── Migrations ────────────────────────────────────────────────────────────────
echo "Running migrations..."
php artisan migrate --force --no-interaction || {
    echo "Migration failed, retrying in 10s..."
    sleep 10
    php artisan migrate --force --no-interaction
}
echo "OK: Migrations done"

# ── Always re-seed (wipes users table and inserts fresh test accounts) ────────
# The seeder uses DB::table('users')->truncate() so every deploy gets clean data.
echo "Seeding fresh test users..."
php artisan db:seed --force --no-interaction
echo "OK: Seeded"

# ── Production cache (file-based — no cache table needed) ────────────────────
echo "Caching config and routes..."
php artisan config:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
