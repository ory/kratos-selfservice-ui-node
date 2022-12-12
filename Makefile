rand := $(shell openssl rand -hex 6)
ROOT_DIR := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
DOCKER_UPSTREAM ?= $(shell cat $(ROOT_DIR)/.docker 2> /dev/null)
DOCKER ?= $(shell which podman || which docker)

.PHONY: docker-dev-build
docker-dev-build:
	$(DOCKER) build --format docker -f ./Dockerfile-dev -t $(DOCKER_UPSTREAM):latest .

.PHONY: docker
docker:
	$(DOCKER) build --format docker -t $(DOCKER_UPSTREAM):latest .

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
	$(DOCKER) build -t $(DOCKER_UPSTREAM):latest . --build-arg LINK=true

.PHONY: clean-sdk
clean-sdk:
	rm -rf node_modules/@ory/client/
	npm i

format: .bin/ory node_modules
	.bin/ory dev headers copyright --type=open-source --exclude=.prettierrc.js --exclude=types
	npm exec -- prettier --write .

licenses: .bin/licenses node_modules  # checks open-source licenses
	.bin/licenses

.bin/licenses: Makefile
	curl https://raw.githubusercontent.com/ory/ci/master/licenses/install | sh

.bin/ory: Makefile
	curl https://raw.githubusercontent.com/ory/meta/master/install.sh | bash -s -- -b .bin ory v0.1.48
	touch .bin/ory

node_modules: package-lock.json
	npm ci
	touch node_modules
