# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Build — install PHP dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS builder

RUN apk add --no-cache \
    git curl zip unzip libpng-dev libzip-dev oniguruma-dev \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — Nginx + PHP-FPM
# ──────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor libpng libzip oniguruma \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip bcmath

WORKDIR /var/www/html

COPY --from=builder /app /var/www/html

COPY docker/nginx.conf      /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh         /start.sh

RUN chmod +x /start.sh && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080

# start.sh runs: migrate → cache → supervisord (nginx + php-fpm)
CMD ["/start.sh"]
