BRANCH ?= dev

production:
	hugo --gc --minify && cp headers/common/headers public/_headers

deploy_preview:
	hugo --gc --minify -b https://$(BRANCH).dawsona.co.uk && cp headers/common/headers public/_headers && cat headers/deploy_preview/headers >> public/_headers