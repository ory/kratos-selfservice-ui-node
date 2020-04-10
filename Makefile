.PHONY: all

docker:
		docker build -t oryd/kratos-selfservice-ui-node:latest .

build-sdk:
		(cd $$KRATOS_DIR; make sdk)
		cp $$KRATOS_DIR/.schema/api.swagger.json ./contrib/sdk/api.swagger.json
		openapi-generator generate -i "./contrib/sdk/api.swagger.json" \
			-g typescript-node \
			-o "./contrib/sdk/generated" \
			--git-user-id ory \
			--git-repo-id sdk \
			--git-host github.com \
			-c ./contrib/sdk/typescript.yml
		(cd ./contrib/sdk/generated; npm i; npm run build)
		rm -rf node_modules/@oryd/kratos-client/*
		cp -r ./contrib/sdk/generated/* node_modules/@oryd/kratos-client

build-sdk-docker:
		build-sdk
		docker build -t oryd/kratos-selfservice-ui-node:latest . --build-arg LINK=true

clean-sdk:
		rm -rf node_modules/@oryd/kratos-client/
		npm i
