FROM node:20-slim AS build

WORKDIR /app

COPY . /app

RUN npm ci --ignore-engines && npm run build


FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
