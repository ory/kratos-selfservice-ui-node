# ORY Kratos as Login Provider for ORY Hydra

**Warning: ** this is a preliminary example and will properly be implemented in ORY Kratos directly.

For now, to run this example execute:

```shell script
$ docker-compose up --build
```

Next, create an OAuth2 Client

```shell script
$ docker-compose exec hydra \
    hydra clients create \
    --endpoint http://127.0.0.1:4445 \
    --id auth-code-client \
    --secret secret \
    --grant-types authorization_code,refresh_token \
    --response-types code,id_token \
    --scope openid,offline \
    --callbacks http://127.0.0.1:5555/callback
```

and perform an OAuth2 Authorize Code Flow

```shell script
$ docker-compose exec hydra \
    hydra token user \
    --client-id auth-code-client \
    --client-secret secret \
    --endpoint http://127.0.0.1:4444/ \
    --port 5555 \
    --scope openid,offline
```
