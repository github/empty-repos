.PHONY: test
test:
	npm install
	npm test
	node -c scripts/empty-repos-scanner.js
