FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS builder

WORKDIR /usr/src/app

ARG LINK=no

COPY package.json package-lock.json ./

RUN npm ci --fetch-timeout=600000

COPY . .

RUN if [ "$LINK" == "true" ]; then \
    (cd ./contrib/sdk/generated; rm -rf node_modules; npm ci; npm run build) && \
    cp -r ./contrib/sdk/generated/* node_modules/@ory/kratos-client/; \
    fi

RUN npm run build && npm prune --omit=dev

# The runtime is the node binary plus the shared libraries it links against
# (musl, libstdc++, libgcc_s); npm, the shell and the package database stay behind.
RUN mkdir -p /rootfs/usr/local/bin && \
    cp /usr/local/bin/node /rootfs/usr/local/bin/ && \
    ldd /usr/local/bin/node | awk '$2 == "=>" { print $3 } $1 ~ /^\// { print $1 }' | sort -u | \
    while read -r lib; do mkdir -p "/rootfs$(dirname "$lib")" && cp -L "$lib" "/rootfs$lib"; done

FROM scratch

COPY --from=builder /rootfs/ /

WORKDIR /usr/src/app

# Static files are served relative to the working directory (src/routes/static.ts).
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/lib ./lib
COPY --from=builder /usr/src/app/views ./views
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules

USER 10000:10000

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/node", "lib/index.js"]
