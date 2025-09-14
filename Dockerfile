FROM node:20 AS build

WORKDIR /app

COPY . /app

RUN yarn install --frozen-lockfile --ignore-engines && yarn build


FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
