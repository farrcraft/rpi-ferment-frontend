COFFEE_PATH="`pwd`/node_modules/coffee-script/bin/coffee"

all: build

build:
	$(COFFEE_PATH) --compile --output lib/ src/

clean:
	rm -rf lib

.PHONY: build clean
