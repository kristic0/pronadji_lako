FROM mysql/mysql-server:8.0

ENV MYSQL_ROOT_PASSWORD='password'
ENV MYSQL_DATABASE=pronadji_lako
ENV MYSQL_USER=admin
ENV MYSQL_PASSWORD=admin

COPY ./init_db.sql /docker-entrypoint-initdb.d/