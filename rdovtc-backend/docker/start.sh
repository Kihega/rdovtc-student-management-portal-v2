#!/bin/sh
# ─────────────────────────────────────────────────────────────
# RDO VTC Backend — Docker entrypoint
# Patched: fixed DB readiness check and auto-seed detection.
# ─────────────────────────────────────────────────────────────
set -e

echo "=== RDO VTC Backend — Starting ==="

cd /var/www/html

# Wait for PostgreSQL via TCP (nc -z) — NOT php artisan db:monitor
echo "Waiting for PostgreSQL to accept connections..."

if [ -n "$DATABASE_URL" ]; then
    _hostpart=$(echo "$DATABASE_URL" | sed 's|postgres://[^@]*@||' | cut -d'/' -f1)
    DB_WAIT_HOST=$(echo "$_hostpart" | cut -d':' -f1)
    DB_WAIT_PORT=$(echo "$_hostpart" | cut -d':' -f2)
    DB_WAIT_PORT=${DB_WAIT_PORT:-5432}
else
    DB_WAIT_HOST=${DB_HOST:-127.0.0.1}
    DB_WAIT_PORT=${DB_PORT:-5432}
fi

_attempts=0
_max=30
until nc -z "$DB_WAIT_HOST" "$DB_WAIT_PORT" 2>/dev/null; do
    _attempts=$((_attempts + 1))
    if [ "$_attempts" -ge "$_max" ]; then
        echo "ERROR: PostgreSQL not reachable after ${_max} attempts."
        exit 1
    fi
    echo "  DB not ready (attempt ${_attempts}/${_max}) — waiting 3s..."
    sleep 3
done
echo "OK: PostgreSQL is up"

# Run migrations
echo "Running migrations..."
php artisan migrate --force --no-interaction
echo "OK: Migrations complete"

# Detect fresh database — use psql if available, else PHP fallback
echo "Checking if database needs seeding..."

USER_COUNT=""

# Method 1: psql direct query (most reliable)
if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_URL" ]; then
    USER_COUNT=$(psql "$DATABASE_URL" -t -A -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "")
fi

# Method 2: php -r with PDO (no PsySH, no ANSI codes)
if [ -z "$USER_COUNT" ] && [ -n "$DATABASE_URL" ]; then
    USER_COUNT=$(php -r "
try {
    \$pdo = new PDO(
        preg_replace('#^postgres://#','pgsql://',getenv('DATABASE_URL')),
        null, null,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo \$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
} catch (Exception \$e) { echo '0'; }
" 2>/dev/null || echo "0")
fi

# Default to 0 if all methods failed
USER_COUNT=${USER_COUNT:-0}
USER_COUNT=$(echo "$USER_COUNT" | tr -d '[:space:]')

if [ "$USER_COUNT" -eq 0 ] 2>/dev/null || [ -z "$USER_COUNT" ]; then
    echo "Fresh database — running seeder..."
    php artisan db:seed --force --no-interaction
    echo "OK: Seed complete — all users and reference data loaded"
else
    echo "INFO: Database has ${USER_COUNT} user(s) — skipping seed"
fi

# Cache for production
echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
