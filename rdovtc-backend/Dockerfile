# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS builder

RUN apk add --no-cache \
    git curl zip unzip libpng-dev libzip-dev oniguruma-dev postgresql-dev

RUN docker-php-ext-install pdo pdo_pgsql mbstring zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor libpng libzip oniguruma postgresql-libs

COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

WORKDIR /var/www/html
COPY --from=builder /app /var/www/html

RUN mkdir -p resources/views storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf       /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh         /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
