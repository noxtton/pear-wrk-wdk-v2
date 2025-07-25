import 'bare-wdk-runtime';
import WdkManager from "../src/wdk-manager.js";
import config from "../chains.json";
const TEST_SEED = 'usual course tiny athlete immense runway job test august merge green snack';

const wdk = new WdkManager(TEST_SEED, config);


// const bitcoinAccount = await wdk.getAccount('bitcoin', 0);
// console.info('[Bitcoin Address]', await bitcoinAccount.getAddress());

const tronAccount = await wdk.getAccount('tron', 0);
console.info('[Tron Address]', await tronAccount.getAddress());

const tonAccount = await wdk.getAccount('ton', 0);
console.info('[Ton Address]', await tonAccount.getAddress());
//
const evmAbstractedAddress = await wdk.getAbstractedAddress('ethereum', 0);
console.info('[EVM Abstracted Address]', evmAbstractedAddress);

const tonAbstractedAddress = await wdk.getAbstractedAddress('ton', 0);
console.info('[TON Abstracted Address]', tonAbstractedAddress);

// const sparkAccount = await wdk.getAccount('spark', 0);
// console.info('SPARK Abstracted Address', await sparkAccount.getAddress());