.PHONY: dev test build clean install-contracts install-frontend

# Development
dev:
	cd frontend && npm run dev

# Testing
test:
	cd contracts && forge test -vvv

test:unit:
	cd frontend && npm run test:unit

test:integration:
	cd frontend && npm run test:integration

test:e2e:
	cd frontend && npm run test:e2e

# Building
build:
	cd contracts && forge build
	cd frontend && npm run build

# Installation
install-contracts:
	export PATH=$$HOME/.foundry/bin:$$PATH && \
	cd contracts && \
	forge install OpenZeppelin/openzeppelin-contracts

install-frontend:
	cd frontend && npm install

install-all: install-contracts install-frontend

# Cleanup
clean:
	cd contracts && forge clean
	cd frontend && rm -rf .next node_modules

# Deployment (requires PRIVATE_KEY in .env)
deploy-contracts:
	cd contracts && forge script script/Deploy.s.sol --rpc-url $${METADIUM_RPC_URL} --broadcast --verify

# Verification
verify-contracts:
	cd contracts && forge verify-contract $${CONTRACT_ADDRESS} --chain-id 11
