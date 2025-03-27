FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx_cerbot.conf /etc/nginx/nginx_cerbot.conf
COPY nginx_ssl.conf /etc/nginx/nginx_ssl.conf

RUN rm /etc/nginx/nginx.conf && ln -s /etc/nginx/nginx_ssl.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]