DOCKER = docker exec -it
NODE = $(DOCKER) cordova_minesweeper
NPM = $(NODE) npm

##
## DEV tools
##

run: ## Run the docker container
	docker run -it  -v $$(pwd):/home/app -w /home/app

build: ## Build the docker container and install nodejs dependencies
	docker build -t cordova_minesweeper .
	#$(NPM) install

install: ## Install dependencies
	$(NPM) install

serve-html: ## Serve the html ui using nginx
	docker run  --rm -v $$(pwd)/www:/usr/share/nginx/html:ro -p 8088:80 nginx:latest

package: ## Build a distruable binary
	$(DOCKER) cordova_minesweeper cordova build
	$(DOCKER) cordova_minesweeper mv platforms/android/app/build/outputs/apk/debug/app-debug.apk dist/android.apk

android: ## Add a cordova android platform
	$(DOCKER) cordova_minesweeper cordova platform add android

bash: ## Run terminal

.DEFAULT_GOAL := help
help: Makefile
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
