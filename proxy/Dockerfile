FROM nginx
RUN rm /etc/nginx/nginx.conf
COPY proxy.conf /etc/nginx/nginx.conf
RUN mkdir /tmp/cache 
VOLUME /etc/nginx
