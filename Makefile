COFFEE_PATH="`pwd`/node_modules/coffee-script/bin/coffee"

all: build frontend

build:
	$(COFFEE_PATH) --compile --output lib/ src/

frontend:
	brunch b

clean:
	rm -rf lib

.PHONY: build clean frontend
