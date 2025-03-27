#!/bin/bash
set -e

echo "Renewing certificates..."
docker run --rm --name pronadji_lako_certbot \
  -v pronadji_lako_certs:/etc/letsencrypt \
  certbot/certbot renew

echo "Reloading NGINX..."
docker exec pronadji_lako_nginx nginx -s reload