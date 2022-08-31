rand := $(shell openssl rand -hex 6)

.PHONY: docker
docker:
		docker build -t oryd/kratos-selfservice-ui-node:latest .

.PHONY: build-sdk
build-sdk:
		(cd $$KRATOS_DIR; make sdk)
		cp $$KRATOS_DIR/spec/api.json ./contrib/sdk/api.json
		npx @openapitools/openapi-generator-cli generate -i "./contrib/sdk/api.json" \
			-g typescript-axios \
			-o "./contrib/sdk/generated" \
			--git-user-id ory \
			--git-repo-id sdk \
			--git-host github.com \
			-c ./contrib/sdk/typescript.yml
		(cd ./contrib/sdk/generated; npm i; npm run build)
		rm -rf node_modules/@ory/kratos-client/*
		cp -r ./contrib/sdk/generated/* node_modules/@ory/client

.PHONY: publish-sdk
publish-sdk: build-sdk
		(cd ./contrib/sdk/generated/; \
			npm --no-git-tag-version version v0.0.0-next.$(rand) && \
			npm publish)
		rm -rf node_modules/@ory/client/*
		sleep 15
		npm i @ory/client@0.0.0-next.$(rand)

.PHONY: build-sdk-docker
build-sdk-docker: build-sdk
		docker build -t oryd/kratos-selfservice-ui-node:latest . --build-arg LINK=true

.PHONY: clean-sdk
clean-sdk:
		rm -rf node_modules/@ory/client/
		npm i
