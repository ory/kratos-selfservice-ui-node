# Ory Kratos NodeJS / ExpressJS User Interface Reference Implementation

[![tests](https://github.com/ory/kratos-selfservice-ui-node/actions/workflows/test.yml/badge.svg)](https://github.com/ory/kratos-selfservice-ui-node/actions/workflows/test.yml)

This repository contains a reference implementation for Ory Kratos' in NodeJS /
ExpressJS / Handlebars / NextJS. It implements all Ory Kratos flows (login,
registration, account settings, account recovery, account verification).

If you only want to add authentication to your app, and not customize the login,
registration, account recovery, ... screens, please check out the
[Ory Kratos Quickstart](https://www.ory.sh/kratos/docs/quickstart).

## Configuration

Below is a list of environment variables required by the Express.js service to
function properly.

In a local development run of the service using `npm run start`, some of these
values will be set by nodemon and is configured by the `nodemon.json` file.

When using this UI with an Ory Network project, you can use `ORY_SDK_URL`
instead of `KRATOS_PUBLIC_URL` and `HYDRA_ADMIN_URL`.

Ory Identities requires the following variables to be set:

- `ORY_SDK_URL` or `KRATOS_PUBLIC_URL` (required): The URL where ORY Kratos's
  Public API is located at. If this app and ORY Kratos are running in the same
  private network, this should be the private network address (e.g.
  `kratos-public.svc.cluster.local`).
- `KRATOS_BROWSER_URL` (optional) The browser accessible URL where ORY Kratos's
  public API is located, only needed if it differs from `KRATOS_PUBLIC_URL`
- `KRATOS_ADMIN_URL` (optional) The URL where Ory Kratos' Admin API is located
  at (e.g. `http://kratos:4434`).

Ory OAuth2 requires more setup to get CSRF cookies on the `/consent` endpoint.

- `ORY_SDK_URL` or `HYDRA_ADMIN_URL` (optional): The URL where Ory Hydra's Admin
  API is located at. If this app and Ory Hydra are running in the same private
  network, this should be the private network address (e.g.
  `hydra-admin.svc.cluster.local`)
- `COOKIE_SECRET` (required): Required for signing cookies. Must be a string
  with at least 8 alphanumerical characters.
- `CSRF_COOKIE_NAME` (required): Change the cookie name to match your domain
  using the `__HOST-example.com-x-csrf-token` format.
- `CSRF_COOKIE_SECRET` (optional): Required for the Consent route to set a CSRF
  cookie with a hashed value. The value must be a string with at least 8
  alphanumerical characters.
- `REMEMBER_CONSENT_SESSION_FOR_SECONDS` (optional): Sets the `remember_for`
  value of the accept consent request in seconds. The default is 3600 seconds.
- `ORY_ADMIN_API_TOKEN` (optional): When using with an Ory Network project, you
  should add the `ORY_ADMIN_API_TOKEN` for OAuth2 Consent flows.
- `DANGEROUSLY_DISABLE_SECURE_CSRF_COOKIES` (optional) This environment
  variables should only be used in local development when you do not have HTTPS
  setup. This sets the CSRF cookies to `secure: false`, required for running
  locally. When using this setting, you must also set `CSRF_COOKIE_NAME` to a
  name without the `__Host-` prefix.
- `TRUSTED_CLIENT_IDS` (optional): A list of trusted client ids. They can be set
  to skip the consent screen.

Getting TLS working:

- `TLS_CERT_PATH` (optional): Path to certificate file. Should be set up
  together with `TLS_KEY_PATH` to enable HTTPS.
- `TLS_KEY_PATH` (optional): Path to key file Should be set up together with
  `TLS_CERT_PATH` to enable HTTPS.

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

There are two ways of serving this application under a base path:

1. Let Express.js handle the routing by setting the `BASE_PATH` environment
   variable to the sub-path, e.g. `/myapp`.
2. Use a reverse proxy or API gateway to strip the path prefix.

The second approach is not always possible, especially when running the
application on a serverless environment. In this case, the first approach is
recommended.

## Development

To run this app with dummy data and no real connection to ORY Kratos, use:

```shell script
NODE_ENV=stub npm start
```

If you would like to also generate fake data for the `id_token`, please set the
environment varialbe `export CONFORMITY_FAKE_CLAIMS=1`

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
