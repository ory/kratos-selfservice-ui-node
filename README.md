# kratos-selfservice-ui-node

[![CircleCI](https://circleci.com/gh/ory/kratos-selfservice-ui-node.svg?style=badge)](https://circleci.com/gh/ory/kratos-selfservice-ui-node)

This is an exemplary Self Service UI for ORY Kratos's Self Service features:

- Registration
- Login
- Logout
- ORY Kratos Error Page

Additionally:

- Dashboard (requires login)

## Development

To run this app with dummy data and no real connection to ORY Kratos, use:

```shell script
$ NODE_ENV=only-ui npm start
```

### Connect to ORY Kratos

If you intend to run this app with ORY Kratos, the easiest way is to use the ORY Kratos Docker Compose Quickstart and build this image with `make docker` (that command builds the `oryd/kratos-selfservice-ui-node:latest` image) before running `docker-compose -f quickstart.yml up` (which uses `oryd/kratos-selfservice-ui-node:latest`) in the ORY Kratos project root. Make sure **not to run `docker pull oryd/kratos-selfservice-ui-node:latest`** before running `docker-compose` or your changes will be overwritten!

## Configuration

This application can be configured using two environment variables:

- `KRATOS_ADMIN_URL`: The URL where ORY Kratos's Admin API is located at. If this app and ORY Kratos
    are running in the same private network, this should be the private network address (e.g. `kratos-admin.svc.cluster.local`).
- `KRATOS_PUBLIC_URL`: The URL where ORY Kratos's Public API is located at. If this app and ORY Kratos
    are running in the same private network, this should be the private network address (e.g. `kratos-public.svc.cluster.local`).
- `KRATOS_BROWSER_URL`: The URL where ORY Kratos's public API is located at, when accessible from the public internet.
    This could be for example `http://kratos.my-app.com/`.
- `BASE_URL`: The base url of this app. If served e.g. behind a proxy or via GitHub pages this would be the path, e.g.
    `/kratos-selfservice-ui-node/`

### With Oathkeeper (JWT)

- `JWKS_URL`: The URL to be used to check if the signature of the incoming ID token is valid.

### Standalone (Cookie)

- `SECURITY_MODE`: If this is set to `COOKIE`, then this app is used without Oathkeeper and rely on cookies (default value is `JWT`). In that case, the ExpressJS server proxies Kratos public API under `/self-service/`.

### Front development

- `NODE_ENV=only-ui`: If setting environment variable `NODE_ENV` to `only-ui`, then all dependencies on
    e.g. ORY Kratos will be disabled and only the UI will be shown. Useful for developing CSS or HTML.
