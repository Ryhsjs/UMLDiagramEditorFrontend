FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY html /var/www/html

EXPOSE 80
