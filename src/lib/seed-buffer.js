import b4a from 'b4a'
import bip39 from 'bip39'
import WdkSecretManager from "@tetherto/wdk-secret-manager";

/**
 * Get a seed buffer from one of the provided sources.
 *
 * @param {Object} options - Options object for selecting the seed source
 * @param {string} [options.seedBuffer] - 64-byte seed buffer in hex format
 * @param {string} [options.seedPhrase] - 12 or 24 word BIP-39 mnemonic phrase
 * @param {Object} [options.encryptedSeed] - Encrypted seed payload. New format: { prf, salt, seedBuffer }
 * @param {string} [options.encryptedSeed.prf] - Passkey/PRF used for decryption
 * @param {string} [options.encryptedSeed.salt] - Salt used for key derivation (hex string)
 * @param {string} [options.encryptedSeed.seedBuffer] - Encrypted seed buffer (hex string)
 * @returns {Uint8Array} - The derived seed buffer
 */
export async function getSeedBuffer(options = {}) {
  let seedBuffer = null;

  if (options.seedBuffer) {
    seedBuffer = b4a.from(options.seedBuffer, 'hex')
  } else if (options.seedPhrase) {
    seedBuffer = await bip39.mnemonicToSeed(options.seedPhrase)
  } else if (options.encryptedSeed) {
    const enc = options.encryptedSeed;
    if (enc && typeof enc === 'object' && (enc.prf || enc.salt || enc.seedBuffer)) {
      if (!enc.prf || !enc.salt || !enc.seedBuffer) {
        throw new Error('Missing prf, salt or encrypted seed buffer for decryption');
      }
      const secretManager = new WdkSecretManager(enc.prf, b4a.from(enc.salt, 'hex'))
      seedBuffer = secretManager.decrypt(b4a.from(enc.seedBuffer, 'hex'));
      secretManager.dispose();
    } else {
      throw new Error('encryptedSeed parameter must be an object');
    }
  }
  if (seedBuffer) return seedBuffer;
  throw new Error('One of the following parameters must be provided: seedBuffer, seedPhrase, or encryptedSeed');
}

export function disposeWdkInitParams(options = {}) {
  if (!options) return;

  for (const key of Object.keys(options)) {
    if (key === 'config' || key === 'enableDebugLogs') continue
    if (Object.prototype.toString.call(options[key]) === '[object Object]') {
      for (const subKey of Object.keys(options[key])) {
        options[key][subKey] = undefined;
      }
    } else {
      options[key] = undefined;
    }
  }
}
