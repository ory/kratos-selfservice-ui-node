# Ory Kratos NodeJS / ExpressJS User Interface Reference Implementation

[![tests](https://github.com/ory/kratos-selfservice-ui-node/actions/workflows/test.yml/badge.svg)](https://github.com/ory/kratos-selfservice-ui-node/actions/workflows/test.yml)

This repository contains a reference implementation for Ory Kratos' in NodeJS /
ExpressJS / Handlebars / NextJS. It implements all Ory Kratos flows (login,
registration, account settings, account recovery, account verification).

If you only want to add authentication to your app, and not customize the login,
registration, account recovery, ... screens, please check out the
[Ory Kratos Quickstart](https://www.ory.sh/kratos/docs/quickstart).

## Configuration

This application can be configured using two environment variables:

- `KRATOS_PUBLIC_URL` (required): The URL where ORY Kratos's Public API is
  located at. If this app and ORY Kratos are running in the same private
  network, this should be the private network address (e.g.
  `kratos-public.svc.cluster.local`).
- `TLS_CERT_PATH` (optional): Path to certificate file. Should be set up
  together with `TLS_KEY_PATH` to enable HTTPS.
- `TLS_KEY_PATH` (optional): Path to key file Should be set up together with
  `TLS_CERT_PATH` to enable HTTPS.
- `KRATOS_BROWSER_URL` (optional) The browser accessible URL where ORY Kratos's
  public API is located, only needed if it differs from `KRATOS_PUBLIC_URL`

This is the easiest mode as it requires no additional set up. This app runs on
port `:4455` and ORY Kratos `KRATOS_PUBLIC_URL` URL.

This mode relies on the browser's ability to send cookies regardless of the
port. Cookies set for `127.0.0.1:4433` will thus also be sent when requesting
`127.0.0.1:4455`. For environments where applications run on separate
subdomains, check out
[Multi-Domain Cookies](https://www.ory.sh/kratos/docs/guides/multi-domain-cookies)

To authenticate incoming requests, this app uses ORY Kratos' `whoami` API to
check whether the session is valid or not.

### Base Path

If you host this application at a sub-path, you can set the `BASE_PATH`
environment variable.

## Development

To run this app with dummy data and no real connection to ORY Kratos, use:

```shell script
$ NODE_ENV=stub npm start
```

### Test with ORY Kratos

The easiest way to test this app with a local installation of ORY Kratos is to
have the [ORY Kratos Quickstart](https://www.ory.sh/kratos/docs/quickstart/)
running. This is what that would look like:

```shell script
# start the quickstart using docker compose as explained in the tutorial: https://www.ory.sh/kratos/docs/quickstart/
export KRATOS_PUBLIC_URL=http://127.0.0.1:4433/
export PORT=4455

# In ORY Kratos run the quickstart:
#
#   make quickstart-dev
#
# Next you need to kill the docker container that runs this app in order to free the ports:
#
#   docker kill kratos_kratos-selfservice-ui-node_1

npm start
```

### Update TypeScript SDK

If you've made changes to the ORY Kratos API you may want to manually generate
the TypeScript SDK in order for URLs and payloads to work as expected. It is
expected that you start this guide from this project's root, wherever you
checked it out. You also need to have the
[`openapi-generator` installed](https://openapi-generator.tech/docs/installation).

```shell script
# Set path to kratos:
export KRATOS_DIR=/path/to/kratos
make build-sdk
```

#### Building the Docker Image

```shell script
# Set path to kratos:
export KRATOS_DIR=/path/to/kratos
make build-sdk-docker
```

#### Clean up

```shell script
make clean-sdk
```
