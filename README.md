# @wdk/bare

A cross-chain Wallet Development Kit (WDK) that provides a unified interface for interacting with multiple blockchains.

## Overview

@wdk/bare is a JavaScript/TypeScript library that simplifies blockchain wallet operations across multiple chains. It provides a consistent API for common wallet operations like address generation, balance checking, and transaction sending, abstracting away the complexities of different blockchain implementations.

## Supported Blockchains

- Ethereum
- Arbitrum
- Polygon
- TON (The Open Network)
- Tron
- Bitcoin
- Solana

## Installation

```bash
npm install @wdk/bare
```

## Usage

### Basic Setup

```javascript
import WdkManager from "@wdk/bare";

// Create a new WDK instance with a seed phrase and configuration
const wdk = new WdkManager(seedPhrase, {
  ethereum: {
    // Ethereum-specific configuration
  },
  arbitrum: {
    // Arbitrum-specific configuration
  },
  // ... other blockchain configurations
});

// Get an address for a specific blockchain
const address = await wdk.getAddress("bitcoin", 0); // 0 is the account index

// Get the balance of an address
const balance = await wdk.getAddressBalance("bitcoin", 0);

// Send a transaction
const txResult = await wdk.sendTransaction("bitcoin", 0, {
  to: "recipient-address",
  value: 1000, // Amount in base units
});

// Clean up resources when done
wdk.dispose();
```

### Abstracted Operations

The library also provides abstracted operations that work across different blockchains:

```javascript
// Get an abstracted address
const address = await wdk.getAbstractedAddress("ethereum", 0);

// Transfer tokens
const transferResult = await wdk.abstractedAccountTransfer("ethereum", 0, {
  token: "evm-contract-token-address",
  recipient: "recipient-address",
  amount: 1000, // Amount in base units
});
```

## React Native Integration

@wdk/bare includes a bundle that can be used with React Native applications:

```javascript
import { bundle } from "@wdk/bare";
```

### Generating the Bundle

The React Native compatible bundle is automatically generated during installation via the `postinstall` script. If you need to regenerate the bundle manually, you can use:

```bash
npm run gen:bundle
```

This command uses `bare-pack` to create a bundle compatible with various iOS and Android architectures:

```bash
npx bare-pack --target ios-arm64 --target ios-arm64-simulator --target ios-x64-simulator --target android-arm --target android-arm64 --target android-ia32 --target android-x64 --linked --imports ./pack.imports.json --out bundle/worklet.bundle.mjs src/worklet.mjs
```

## React Native Usage

### Basic Setup

```javascript
import { Worklet } from "react-native-bare-kit";
import { bundle } from "@wdk/bare";

const wdkManager = new Worklet();
wdkManager.start("/wdk.manager.worklet.bundle", bundle);

//configure WDK manager
await wdkManager.workletStart({
  enableDebugLogs: 0, //enable/disable debug mode
  seedPhrase: seed, //12/24 word seed phrase
  config: config, //json object
});

//get btc address
const address = await wdkManager.getAddress({
  network: "bitcoin",
  accountIndex: 0,
});

//Get EVM based blockchain address
const address = await wdkManager.getAbstractedAddress({
  network: "polygon",
  accountIndex: 0,
});

//Get EVM based blockchain address balance
const evmAbstractedTokenBalance = await rpc.getAbstractedAddressTokenBalance({
  network: "polygon",
  accountIndex: 0,
  tokenAddress: "evm-contract-token-address",
});

const tx = await rpc.abstractedAccountTransfer({
  network: "polygon",
  accountIndex: 0,
  options: {
    token: "evm-contract-token-address",
    recipient: "recipient-address",
    amount: 1000, //Amount in base units
  },
});
```

## API Documentation

For detailed API documentation, see the [HRPC Command Documentation](./hrpc-doc.md).

## Dependencies

This library depends on several @wdk packages for blockchain-specific implementations:

- @wdk/wallet - Core wallet functionality
- @wdk/wallet-btc - Bitcoin implementation
- @wdk/wallet-evm - Ethereum, Arbitrum, and Polygon implementation
- @wdk/wallet-evm-erc-4337 - ERC-4337 (Account Abstraction) support
- @wdk/wallet-solana - Solana implementation
- @wdk/wallet-ton - TON implementation
- @wdk/wallet-ton-gasless - Gasless transactions on TON
- @wdk/wallet-tron - Tron implementation
- @wdk/wallet-tron-gasfree - Gasfree transactions on Tron

## Development

### Building

```bash
# Build TypeScript definitions
npm run build:types

# Generate schema and HRPC documentation
npm run gen:schema

# Generate bundle for React Native
npm run gen:bundle
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## License

Apache License 2.0
