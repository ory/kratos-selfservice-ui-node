# kratos-selfservice-ui-node

[![CircleCI](https://circleci.com/gh/ory/kratos-selfservice-ui-node.svg?style=badge)](https://circleci.com/gh/ory/kratos-selfservice-ui-node)

This is an exemplary Self Service UI for ORY Kratos's Self Service features:

- Registration
- Login
- Logout
- User settings
  - Update profile
  - Change password
- Password reset
- ORY Kratos user error page

Additionally:

- Dashboard (requires login)

## Configuration

This application can be configured using two environment variables:

- `KRATOS_ADMIN_URL` (required): The URL where ORY Kratos's Admin API is located at. If
  this app and ORY Kratos are running in the same private network, this should
  be the private network address (e.g. `kratos-admin.svc.cluster.local`).
- `KRATOS_PUBLIC_URL` (required): The URL where ORY Kratos's Public API is located at. If
  this app and ORY Kratos are running in the same private network, this should
  be the private network address (e.g. `kratos-public.svc.cluster.local`).
- `BASE_URL` (optional): The base url of this app. If served e.g. behind a proxy or via
  GitHub pages this would be the path, e.g. `https://mywebsite.com/kratos-selfservice-ui-node/`.
  **Must be absolute!**

### Network Setup

This application works in two set ups:

- Standalone with ORY Kratos
- With the ORY Oathkeeper Reverse Proxy

#### Standalone using cookies

This mode adds a route to the app which proxies all traffic flowing to `/.ory/kratos/public/*`
to ORY Krato's Public API. That way, this app an ORY Kratos share the same domain
and port which makes cookies work.

To authenticate incoming requests, this app uses ORY Krato's `whoami` API to check
whether the session is valid or not.

To enable this mode, set the environment variable `SECURITY_MODE=cookie`.

### With Oathkeeper using JSON Web Tokens (JWT)

This mode requires ORY Oathkeeper to route all incoming traffic to either ORY Kratos
or this app. It is expected that no browser traffic can reach this app or ORY Kratos
directly.

This app then expects ORY Oathkeeper to use the `id_token` mutator which is a
JSON Web Token this app validates in order to figure out if a request is authorized (logged in)
or not.

To enable this mode, set the environment variable `SECURITY_MODE=jwt`. Additionally
these two environment variables must be set:

- `JWKS_URL`: This URL contains the JSON Web Key Sets ("jwks") that can be
used to verify the JSON Web Tokens. When using ORY Oathkeeper, you should
point this URL to ORY Oathkeeper's JWKS API (the API port, not the proxy port!),
e.g. `https://my-oathkeeper-api/.well-known/jwks.json`.
- `KRATOS_BROWSER_URL`: The URL where ORY Kratos's public API is located at,
  when accessible from the public internet via ORY Oathkeeper. This could be for example
  `http://kratos.my-app.com/`.

## Development

To run this app with dummy data and no real connection to ORY Kratos, use:

```shell script
$ NODE_ENV=stub npm start
```

### Test with ORY Kratos

The easiest way to test this app with a local installation of ORY Kratos is to
use `SECURITY_MODE=cookie` and have the [ORY Kratos Quickstart](https://www.ory.sh/kratos/docs/quickstart/)
running. This is what that would look like:

```shell script
# start the quickstart using docker compose as explained in the tutorial: https://www.ory.sh/kratos/docs/quickstart/
export SECURITY_MODE=cookie
export KRATOS_PUBLIC_URL=http://127.0.0.1:4433/
export KRATOS_ADMIN_URL=http://127.0.0.1:4434/
export PORT=4455

# In ORY Kratos, run the quickstart:
#
#   make quickstart-dev
# 
# Next you need to kill the docker container that runs this app in order to free the ports:
#
#   docker kill kratos_oathkeeper_1

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
