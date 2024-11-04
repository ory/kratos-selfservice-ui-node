FROM node:22-alpine as builder

WORKDIR /usr/src/app

ARG LINK=no

COPY package.json package-lock.json ./

RUN npm ci --fetch-timeout=600000

COPY . .

RUN if [ "$LINK" == "true" ]; then \
    (cd ./contrib/sdk/generated; rm -rf node_modules; npm ci; npm run build) && \
    cp -r ./contrib/sdk/generated/* node_modules/@ory/kratos-client/; \
    fi

RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ ./

ENV PORT=3000
EXPOSE ${PORT}

CMD ["/usr/src/app/lib/index.js"]
