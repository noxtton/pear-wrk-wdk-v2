import HRPC from '../spec/hrpc'

import WdkManager from './wdk-core/wdk-manager.js'
import { stringifyError } from './exceptions/rpc-exception.js'
import b4a from 'b4a'
import bip39 from "bip39";
import WdkSecretManager from "@wdk/wdk-secret-manager";


// eslint-disable-next-line no-undef
const { IPC } = BareKit

const rpc = new HRPC(IPC)
/**
 *
 * @type {WdkManager}
 */
let wdk = null


/**
 * @typedef {Object} WorkletStartInit
 * @property {String} seedPhrase - The seed phrase string
 * @property {String} seedBuffer - The seed buffer string as hex
 * @property {String} encryptedSeed - The encrypted seed buffer as hex string
 * @property {String} salt - A 16-byte salt string for key derivation
 * @property {String} prf - The passkey/PRF (Pseudo-Random Function) string for decryption
 * @property {string} config - JSON string containing WDK configuration
 */

/**
 *
 * @returns {Promise<{status: string}>} Status object indicating successful start
 * @throws {Error} If decryption fails or WdkManager initialization fails
 */
rpc.onWorkletStart(async (/** @type {WorkletStartInit} */ init) => {
  try {
    if (wdk) wdk.dispose(); // cleanup existing;
    const salt = b4a.from(init.salt, "hex");
    const passkey = init.prf;
    const secretManager = new WdkSecretManager(passkey, salt);

    const seedBuffer = init.seedBuffer
      ? b4a.from(init.seedBuffer, "hex")
      : init.seedPhrase
      ? await bip39.mnemonicToSeed(init.seedPhrase)
      : init.encryptedSeed
      ? secretManager.decrypt(b4a.from(init.encryptedSeed, "hex"))
      : null;

    if (seedBuffer === null) {
      throw new Error("Either seed phrase, seed buffer, or encrypted seed must be provided");
    }

    wdk = new WdkManager(seedBuffer, JSON.parse(init.config));
    secretManager.dispose();

    init.seedPhrase = null;
    init.seedBuffer = null;

    return { status: "started" };
  } catch (error) {
    throw new Error(stringifyError(error));
  }
});

rpc.onGetAddress(async payload => {
  try {
    return { address: await wdk.getAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetAddressBalance(async payload => {
  try {
    const balance = await wdk.getAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onQuoteSendTransaction(async payload => {
  try {
    // Convert amount value to number
    payload.options.value = Number(payload.options.value)
    const transaction = await wdk.quoteSendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onSendTransaction(async payload => {
  try {
    payload.options.value = Number(payload.options.value)
    const transaction = await wdk.sendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee.toString(), hash: transaction.hash }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

/*****************
 *
 * Secret Manager
 *
 *****************/

rpc.onGenerateAndEncrypt(async (payload) => {
  try {
    if (payload.derivedKey) {
      payload.derivedKey = b4a.from(payload.derivedKey, "hex");
    }
    payload.salt = b4a.from(payload.salt, "hex");
    const manager = new WdkSecretManager(payload.passkey, payload.salt);
    const entropy = payload.seedPhrase
      ? manager.mnemonicToEntropy(payload.seedPhrase)
      : null;
    const { encryptedSeed, encryptedEntropy } =
      await manager.generateAndEncrypt(entropy, payload.derivedKey);
    manager.dispose();
    return {
      encryptedSeed: b4a.toString(encryptedSeed, "hex"),
      encryptedEntropy: b4a.toString(encryptedEntropy, "hex"),
    };
  } catch (e) {
    throw new Error(`${e.message}: ${e.stack}`);
  }
});

rpc.onDecrypt(async (payload) => {
  try {
    if (payload.derivedKey) {
      payload.derivedKey = b4a.from(payload.derivedKey, "hex");
    }
    payload.salt = b4a.from(payload.salt, "hex");
    const manager = new WdkSecretManager(
      payload.passkey,
      b4a.from(payload.salt, "hex")
    );
    const decryptedData = manager.decrypt(
      b4a.from(payload.encryptedData, "hex"),
      payload.derivedKey
    );
    manager.dispose();
    return {
      result: b4a.toString(decryptedData, "hex"),
    };
  } catch (e) {
    console.error(e.message);
    return {
      result: null,
    };
  }
});

rpc.onGenerateSeed(async () => {
  try {
    const entropy = WdkSecretManager.generateRandomBuffer();
    const mnemonic = bip39.entropyToMnemonic(entropy);
    return {
      mnemonic,
    };
  } catch (e) {
    throw new Error(`${e.message}: ${e.stack}`);
  }
});

/*****************
 *
 * ABSTRACTION
 *
 *****************/
rpc.onGetAbstractedAddress(async payload => {
  try {
    return { address: await wdk.getAbstractedAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetAbstractedAddressBalance(async payload => {
  try {
    const balance = await wdk.getAbstractedAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetAbstractedAddressTokenBalance(async payload => {
  try {
    const balance = await wdk.getAbstractedAddressTokenBalance(payload.network, payload.accountIndex, payload.tokenAddress)
    return { balance: balance.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onAbstractedAccountTransfer(async payload => {
  try {
    payload.options.amount = Number(payload.options.amount)
    const transfer = await wdk.abstractedAccountTransfer(payload.network, payload.accountIndex, payload.options, payload.config)
    return { fee: transfer.fee.toString(), hash: transfer.hash }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onAbstractedSendTransaction(async payload => {
  try {
    const options = JSON.parse(payload.options)
    const transfer = await wdk.abstractedSendTransaction(payload.network, payload.accountIndex, options, payload.config)
    return { fee: transfer.fee.toString(), hash: transfer.hash }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onAbstractedAccountQuoteTransfer(async payload => {
  try {
    payload.options.amount = Number(payload.options.amount)
    const transfer = await wdk.abstractedAccountQuoteTransfer(payload.network, payload.accountIndex, payload.options, payload.config)
    return { fee: transfer.fee.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetTransactionReceipt(async payload => {
  try {
    const receipt = await wdk.getTransactionReceipt(payload.network, payload.accountIndex, payload.hash)
    if (receipt) {
      return { receipt: JSON.stringify(receipt) }
    }
    return {}
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetApproveTransaction(async payload => {
  try {
    payload.amount = Number(payload.amount)
    const approveTx = await wdk.getApproveTransaction(payload)
    if (approveTx) {
      approveTx.value = approveTx.value.toString()
      return approveTx
    }
    return {}
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onDispose(() => {
  try {
    wdk.dispose()
    wdk = null
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})
