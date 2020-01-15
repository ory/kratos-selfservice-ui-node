# The dev-kratos-quickstart command runs this app and connects it to the quicktart docker-compose set up
# of ORY Kratos (docker-compose -f quickstart.yml up). It allows to develop this app without having to constantly
# re-build Docker images
#
# Please be aware that the dashboard will not work because ORY Oathkeeper is configured for the internal docker cluster,
# not this app.
.PHONY: dev-kratos-quickstart
dev-kratos-quickstart:
		(sleep 5 && open http://127.0.0.1:3000/auth/login &)
		JWKS_URL=http://127.0.0.1:4456/.well-known/jwks.json \
			KRATOS_PUBLIC_URL=http://127.0.0.1:4433/ \
            KRATOS_BROWSER_URL=http://127.0.0.1:4455/.ory/kratos/public \
            npm run start

.PHONY: docker
docker:
		docker build -t oryd/kratos-selfservice-ui-node:latest .
