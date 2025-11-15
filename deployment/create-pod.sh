#!/bin/bash

HOSTING_PC_IP="${HOSTING_PC_IP:-192.168.0.102}"

APP_HOST_PORT="${APP_HOST_PORT:-8090}"
APP_CONTAINER_PORT="${APP_CONTAINER_PORT:-8080}"
ADMINER_HOST_PORT="${ADMINER_HOST_PORT:-8080}"
ADMINER_CONTAINER_PORT="${ADMINER_CONTAINER_PORT:-80}"
POSTGREST_PORT="${POSTGREST_PORT:-3000}"
POSTGREST_CONTAINER_PORT="${POSTGREST_CONTAINER_PORT:-3000}"
SWAGGER_HOST_PORT="${SWAGGER_HOST_PORT:-3001}"
SWAGGER_CONTAINER_PORT="${SWAGGER_CONTAINER_PORT:-8081}"
PC2_APP_WS_PORT="${PC2_APP_WS_PORT:-3002}"

: "${HOSTING_PC_IP:?HOSTING_PC_IP must be set}"
: "${APP_HOST_PORT:?APP_HOST_PORT must be set}"
: "${APP_CONTAINER_PORT:?APP_CONTAINER_PORT must be set}"
: "${ADMINER_HOST_PORT:?ADMINER_HOST_PORT must be set}"
: "${ADMINER_CONTAINER_PORT:?ADMINER_CONTAINER_PORT must be set}"
: "${POSTGREST_PORT:?POSTGREST_PORT must be set}"
: "${POSTGREST_CONTAINER_PORT:?POSTGREST_CONTAINER_PORT must be set}"
: "${SWAGGER_HOST_PORT:?SWAGGER_HOST_PORT must be set}"
: "${SWAGGER_CONTAINER_PORT:?SWAGGER_CONTAINER_PORT must be set}"
: "${PC2_APP_WS_PORT:?PC2_APP_WS_PORT must be set}"

export HOSTING_PC_IP POSTGREST_PORT

systemctl --user stop pod-pc2-laptimes.service

podman pod create --name pc2-laptimes \
  -p "${APP_HOST_PORT}:${APP_CONTAINER_PORT}" \
  -p "${ADMINER_HOST_PORT}:${ADMINER_CONTAINER_PORT}" \
  -p "${POSTGREST_PORT}:${POSTGREST_CONTAINER_PORT}" \
  -p "${SWAGGER_HOST_PORT}:${SWAGGER_CONTAINER_PORT}" \
  -p "${PC2_APP_WS_PORT}:3002"

# Create volume if it doesn't exist
podman volume exists pc2-laptimes-pgdata || podman volume create pc2-laptimes-pgdata

# Create secret if it doesn't exist
if ! podman secret ls --format "{{.Name}}" | grep -q "^pg_pass$"; then
  echo "Secret 'pg_pass' not found. Please enter the PostgreSQL password:"
  read -r -s -p "Password: " PG_PASSWORD
  echo ""
  echo -n "${PG_PASSWORD}" | podman secret create pg_pass -
  echo "Secret 'pg_pass' created successfully."
else
  echo "Secret 'pg_pass' already exists, skipping creation."
fi

podman run -d \
  --name pc2-laptimes-postgres \
  --pod pc2-laptimes \
  --memory=512m \
  --memory-swap=512m \
  -v pc2-laptimes-pgdata:/var/lib/postgresql/data \
  --secret pg_pass,type=mount,target=/run/secrets/pg_pass \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/pg_pass \
  -e POSTGRES_SHARED_BUFFERS=128MB \
  -e POSTGRES_EFFECTIVE_CACHE_SIZE=256MB \
  docker.io/library/postgres:17

podman run -d --name pc2-laptimes-adminer --pod pc2-laptimes \
  --memory=128m \
  docker.io/library/adminer:5

podman run -d --name pc2-laptimes-app --pod pc2-laptimes \
  --memory=256m \
  localhost/pc2-laptimes:latest

# Read the password from Podman secret using a temporary container
DB_PASSWORD=$(podman run --rm --secret pg_pass,type=mount,target=/run/secrets/pg_pass alpine cat /run/secrets/pg_pass)

podman run -d --name pc2-laptimes-api \
  --pod pc2-laptimes \
  --memory=128m \
  -e PGRST_DB_URI="postgres://postgres:${DB_PASSWORD}@localhost:5432/pc2-laptimes" \
  -e PGRST_DB_SCHEMA=public \
  -e PGRST_DB_ANON_ROLE=postgres \
  -e PGRST_DB_CHANNEL_ENABLED=false \
  -e PGRST_OPENAPI_SERVER_PROXY_URI="http://${HOSTING_PC_IP}:${POSTGREST_PORT}" \
  docker.io/postgrest/postgrest:latest

podman run -d --name pc2-laptimes-swagger \
  --pod pc2-laptimes \
  --memory=128m \
  -e URLS="[ { \"url\": \"http://${HOSTING_PC_IP}:${POSTGREST_PORT}/\", \"name\": \"PostgREST\" } ]" \
  -e PORT="${SWAGGER_CONTAINER_PORT}" \
  docker.io/swaggerapi/swagger-ui

podman generate systemd --new --name pc2-laptimes --files --restart-policy=always
mv *.service ~/.config/systemd/user
systemctl --user daemon-reload
systemctl --user enable --now pod-pc2-laptimes.service
