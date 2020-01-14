# kratos-selfservice-ui-node

This is an exemplary Self Service UI for ORY Kratos's Self Service features:

- Registration
- Login
- Logout
- ORY Kratos Error Page

Additionally:

- Dashboard (requires login)

## Configuration

This application can be configured using two environment variables:

- `JWKS_URL` - The URL to be used to check if the signature of the incoming ID token is valid.
- `KRATOS_PUBLIC_URL`: The URL where ORY Kratos's public API is located at. If this app and ORY Kratos
    are running in the same private network, this should be the private network address (e.g. `kratos-public.svc.cluster.local`).
- `KRATOS_BROWSER_URL`: The URL where ORY Kratos's public API is located at, when accessible from the public internet.
    This could be for example `http://kratos.my-app.com/`.
- `BASE_URL`: The base url of this app. If served e.g. behind a proxy or via GitHub pages this would be the path, e.g.
    `/kratos-selfservice-ui-node/`
- `NODE_ENV=only-ui`: If setting environment variable `NODE_ENV` to `only-ui`, then all dependencies on
    e.g. ORY Kratos will be disabled and only the UI will be shown. Useful for developing CSS or HTML.
