FROM docker.io/library/node:22-slim AS build

WORKDIR /app

COPY . /app

# Injected by deploy.sh from the pg_jwt_secret Podman secret. The token is
# compiled into the public bundle, so it is a write gate, not a user secret.
ARG VUE_APP_PGRST_JWT=""
ENV VUE_APP_PGRST_JWT=$VUE_APP_PGRST_JWT

RUN npm ci --ignore-engines && npm run build


FROM docker.io/library/nginx:alpine

# Install Node.js for the WebSocket server
RUN apk add --no-cache nodejs npm

# Copy the built web app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy and setup WebSocket server
WORKDIR /app/ws-server
COPY ws-server/package*.json ./
RUN npm ci --omit=dev
COPY ws-server/server.js ./

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 3002

CMD ["/docker-entrypoint.sh"]
