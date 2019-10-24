# hive-selfservice-ui-node

This is an exemplary Self Service UI for ORY Hive's Self Service features:

- Registration
- Login

## Configuration

This application can be configured using two environment variables:

- `HIVE_PUBLIC_URL`: The URL where ORY Hive's public API is located at. If this app and ORY Hive
    are running in the same private network, this should be the private network address (e.g. `hive-public.svc.cluster.local`).
- `HIVE_BROWSER_URL`: The URL where ORY Hive's public API is located at, when accessible from the public internet.
    This could be for example `http://hive.my-app.com/`.
- `BASE_URL`: The base url of this app. If served e.g. behind a proxy or via GitHub pages this would be the path, e.g.
    `/hive-selfservice-ui-node/`
