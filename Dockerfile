FROM node:13.6-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG LINK=no

COPY . /usr/src/app
RUN npm ci
RUN if [ "$LINK" == "true" ] ; then cp -r ./contrib/sdk/generated/* node_modules/@oryd/kratos-client/; (cd node_modules/@oryd/kratos-client; rm -rf node_modules; npm run build) ; fi
RUN npm run build

ENTRYPOINT npm run serve

EXPOSE 3000
