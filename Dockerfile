FROM nginx:stable-alpine

ENV BACKEND_HOST=api \
    BACKEND_PORT=8000 \
    NGINX_ENVSUBST_FILTER=^BACKEND_(HOST|PORT)$

COPY templates /etc/nginx/templates
COPY html /usr/share/nginx/html

EXPOSE 80
