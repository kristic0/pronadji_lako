#!/bin/bash
set -xe

if [[ -z "$HUB_USER" || -z "$DATABASE_IMG" || -z "$DATABASE_TAG" || -z "$BACKEND_IMG" || -z "$BACKEND_TAG" || -z "$REACT_IMG" || -z "$REACT_TAG" ]]; then
  echo "Error: One or more required environment variables are missing!"
  exit 1
fi

NOMINATIM_IMG="nominatim_serbia_15"
NOMINATIM_TAG="latest"

echo "Logging into Docker Registry..."
docker login -u "$REGISTRY_USER" -p "$REGISTRY_PASS"

echo "Pulling latest images..."
docker pull "$HUB_USER/$DATABASE_IMG:$DATABASE_TAG"
docker pull "$HUB_USER/$BACKEND_IMG:$BACKEND_TAG"
docker pull "$HUB_USER/$REACT_IMG:$REACT_TAG"

echo "Stopping and removing old containers..."
docker stop pronadji_lako_db_container pronadji_lako_backend_container pronadji_lako_react_container pronadji_lako_nominatim || true
docker rm pronadji_lako_db_container pronadji_lako_backend_container pronadji_lako_react_container pronadji_lako_nominatim || true

echo "Creating Docker network if not exists..."
docker network create pronadji_lako_network || true

echo "Starting new containers..."
docker run -d --name pronadji_lako_db_container --network pronadji_lako_network -p 3306 "$HUB_USER/$DATABASE_IMG:$DATABASE_TAG"
docker run -d --name pronadji_lako_backend_container --network pronadji_lako_network -e DB_HOST=pronadji_lako_db_container -e NODE_ENV=prod -p 4000 "$HUB_USER/$BACKEND_IMG:$BACKEND_TAG"
docker run -d --name pronadji_lako_react_container --network pronadji_lako_network -p 80 "$HUB_USER/$REACT_IMG:$REACT_TAG"
docker run -d --name pronadji_lako_nominatim --network pronadji_lako_network -p 8080 "$HUB_USER/$NOMINATIM_IMG:$NOMINATIM_TAG"

echo "Deployment complete!"