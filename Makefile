BRANCH ?= dev

production:
	hugo --gc --minify && cp headers/common/headers public/_headers

deploy_preview:
	hugo --gc --buildDrafts --minify -b https://$(BRANCH).dawsona.co.uk && cp headers/common/headers public/_headers && cat headers/preview_deploy/headers >> public/_headers
