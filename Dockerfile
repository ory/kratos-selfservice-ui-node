FROM node:13.6-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm ci
RUN ./link-npm-packages.sh
RUN npm run build

ENTRYPOINT npm run serve

EXPOSE 3000
