#!/bin/sh
# RDO VTC Backend — Docker entrypoint (Render-compatible)
# Uses PHP PDO to wait for PostgreSQL — no netcat/nc needed.
set -e

echo "=== RDO VTC Backend — Starting ==="
cd /var/www/html

# ── Wait for PostgreSQL using PHP PDO ─────────────────────────────────────────
# We use PHP itself (not nc/psql) because Render's internal DB hostname only
# resolves correctly inside the PHP runtime after the container joins the
# private network. nc -z fails at early startup even when the DB is healthy.
echo "Waiting for PostgreSQL..."

_attempts=0
_max=40          # 40 x 5s = up to 200s — Render DB can take ~60s to be ready

until php -r "
    \$url = getenv('DATABASE_URL');
    if (!empty(\$url)) {
        // postgres://user:pass@host:port/dbname  ->  pgsql:host=...
        \$url = preg_replace('#^postgres://#', 'pgsql://', \$url);
        \$parts = parse_url(\$url);
        \$dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
            \$parts['host'], \$parts['port'] ?? 5432, ltrim(\$parts['path'],'/'));
        \$u = \$parts['user'];  \$p = \$parts['pass'];
    } else {
        \$dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
            getenv('DB_HOST') ?: '127.0.0.1',
            getenv('DB_PORT') ?: '5432',
            getenv('DB_DATABASE') ?: 'rdovtc',
            getenv('DB_SSLMODE') ?: 'require');
        \$u = getenv('DB_USERNAME'); \$p = getenv('DB_PASSWORD');
    }
    try {
        new PDO(\$dsn, \$u, \$p, [PDO::ATTR_TIMEOUT => 3]);
        exit(0);
    } catch (Exception \$e) {
        exit(1);
    }
" 2>/dev/null
do
    _attempts=$((_attempts + 1))
    if [ "$_attempts" -ge "$_max" ]; then
        echo "ERROR: PostgreSQL not ready after $((_max * 5))s."
        echo "  Check: is DATABASE_URL set in Render environment variables?"
        echo "  Check: is the PostgreSQL database linked to this web service?"
        exit 1
    fi
    echo "  Waiting for DB... attempt ${_attempts}/${_max} (${_attempts}x5s elapsed)"
    sleep 5
done
echo "OK: PostgreSQL is ready"

# ── Migrations (with one retry in case of a race condition) ──────────────────
echo "Running migrations..."
php artisan migrate --force --no-interaction || {
    echo "Migration failed — waiting 10s and retrying once..."
    sleep 10
    php artisan migrate --force --no-interaction
}
echo "OK: Migrations done"

# ── Seed only on a fresh database ────────────────────────────────────────────
echo "Checking seed status..."
USER_COUNT=$(php -r "
    \$url = getenv('DATABASE_URL');
    if (!empty(\$url)) {
        \$url  = preg_replace('#^postgres://#', 'pgsql://', \$url);
        \$p    = parse_url(\$url);
        \$dsn  = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
            \$p['host'], \$p['port'] ?? 5432, ltrim(\$p['path'],'/'));
        \$u = \$p['user']; \$pw = \$p['pass'];
    } else {
        \$dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
            getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_PORT') ?: '5432',
            getenv('DB_DATABASE') ?: 'rdovtc', getenv('DB_SSLMODE') ?: 'require');
        \$u = getenv('DB_USERNAME'); \$pw = getenv('DB_PASSWORD');
    }
    try {
        \$pdo = new PDO(\$dsn, \$u, \$pw);
        echo \$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    } catch (Exception \$e) { echo '0'; }
" 2>/dev/null | tr -d '[:space:]')

USER_COUNT=${USER_COUNT:-0}
if [ "$USER_COUNT" -eq 0 ] 2>/dev/null; then
    echo "Fresh DB — seeding..."
    php artisan db:seed --force --no-interaction
    echo "OK: Seed complete"
else
    echo "INFO: ${USER_COUNT} user(s) exist — skipping seed"
fi

# ── Production cache ──────────────────────────────────────────────────────────
echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache
echo "OK: Cache warm"

echo "Starting Nginx + PHP-FPM on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
