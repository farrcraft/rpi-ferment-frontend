COFFEE_PATH="`pwd`/node_modules/coffee-script/bin/coffee"
RECESS_PATH="`pwd`/node_modules/recess/bin/recess"
UGLIFYJS_PATH="`pwd`/node_modules/uglify-js/bin/uglifyjs"

# twitter bootstrap settings
BOOTSTRAP_SRC = ./bootstrap
BOOTSTRAP_LESS = ${BOOTSTRAP_SRC}/less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = ${BOOTSTRAP_SRC}/less/responsive.less
# compiled bootstrap files go here
BOOTSTRAP_OUTDIR = ./public/bootstrap

all: build

build:
	$(COFFEE_PATH) --compile --output lib/ src/
	$(COFFEE_PATH) --compile --output public/js/ client-src/

# generate twitter bootstrap css & js from source
bootstrap:
	$(RECESS_PATH) --compile ${BOOTSTRAP_LESS} > ${BOOTSTRAP_OUTDIR}/css/bootstrap.css
	$(RECESS_PATH) --compress ${BOOTSTRAP_LESS} > ${BOOTSTRAP_OUTDIR}/css/bootstrap.min.css
	$(RECESS_PATH) --compile ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_OUTDIR}/css/bootstrap-responsive.css
	$(RECESS_PATH) --compress ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_OUTDIR}/css/bootstrap-responsive.min.css
	cat \
	${BOOTSTRAP_SRC}/js/bootstrap-transition.js \
	${BOOTSTRAP_SRC}/js/bootstrap-alert.js \
	${BOOTSTRAP_SRC}/js/bootstrap-button.js \
	${BOOTSTRAP_SRC}/js/bootstrap-carousel.js \
	${BOOTSTRAP_SRC}/js/bootstrap-collapse.js \
	${BOOTSTRAP_SRC}/js/bootstrap-dropdown.js \
	${BOOTSTRAP_SRC}/js/bootstrap-modal.js \
	${BOOTSTRAP_SRC}/js/bootstrap-tooltip.js \
	${BOOTSTRAP_SRC}/js/bootstrap-popover.js \
	${BOOTSTRAP_SRC}/js/bootstrap-scrollspy.js \
	${BOOTSTRAP_SRC}/js/bootstrap-tab.js \
	${BOOTSTRAP_SRC}/js/bootstrap-typeahead.js > ${BOOTSTRAP_OUTDIR}/js/bootstrap.js
	$(UGLIFYJS_PATH) -nc ${BOOTSTRAP_OUTDIR}/js/bootstrap.js > ${BOOTSTRAP_OUTDIR}/js/bootstrap.min.tmp.js
	echo "/*!\n* Bootstrap.js by @fat & @mdo\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > ${BOOTSTRAP_OUTDIR}/js/copyright.js
	cat ${BOOTSTRAP_OUTDIR}/js/copyright.js ${BOOTSTRAP_OUTDIR}/js/bootstrap.min.tmp.js > ${BOOTSTRAP_OUTDIR}/js/bootstrap.min.js
	rm ${BOOTSTRAP_OUTDIR}/js/copyright.js ${BOOTSTRAP_OUTDIR}/js/bootstrap.min.tmp.js


# watch source files for changes & rebuild
watch:
	echo "Watching less files..."; \
	watchr -e "watch('bootstrap/less/.*\.less') { system 'make bootstrap' }"


clean:
	rm -rf lib

.PHONY: build bootstrap clean
