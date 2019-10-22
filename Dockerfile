FROM node:12.13-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm ci
RUN npm run build

ENTRYPOINT npm run serve

EXPOSE 3000
