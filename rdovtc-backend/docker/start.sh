#!/bin/sh
set -e

echo "=== RDO VTC Backend — Starting ==="

cd /var/www/html

# Wait for PostgreSQL to be ready (Render can take a few seconds)
echo "⏳ Waiting for database..."
until php artisan db:monitor --max=10 > /dev/null 2>&1; do
  echo "   Database not ready yet — retrying in 3s..."
  sleep 3
done
echo "✅ Database is up"

# Run migrations (safe to run on every deploy — skips already-run migrations)
echo "🔄 Running migrations..."
php artisan migrate --force --no-interaction
echo "✅ Migrations complete"

# Cache config and routes for production performance
echo "⚡ Caching config & routes..."
php artisan config:cache
php artisan route:cache
echo "✅ Cache warm"

# Start Nginx + PHP-FPM via Supervisor
echo "🚀 Starting web server on port 8080..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
