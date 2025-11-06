import b4a from 'b4a'
import bip39 from 'bip39'
import {WdkSecretManager} from "@tetherto/wdk-secret-manager";
import {sodium_memzero} from "sodium-native";

/**
 * Get a seed buffer from one of the provided sources.
 *
 * @param {Object} options - Options object for selecting the seed source
 * @param {Buffer | Uint8Array} [options.seedBuffer] - 64-byte seed buffer in hex format
 * @param {string} [options.seedPhrase] - 12 or 24 word BIP-39 mnemonic phrase
 * @param {Object} [options.encryptedSeed] - Encrypted seed payload. New format: { passkey, salt, seedBuffer }
 * @param {buffer} [options.encryptedSeed.passkey] - Passkey/PRF used for decryption
 * @param {buffer} [options.encryptedSeed.salt] - Salt used for key derivation (hex string)
 * @param {Buffer | Uint8Array} [options.encryptedSeed.seedBuffer] - Encrypted seed buffer (hex string)
 * @returns {Uint8Array} - The derived seed buffer
 */
export async function getSeedBuffer(options = {}) {
  let seedBuffer = null;

  if (options.seedBuffer) {
    // Accept Uint8Array/Buffer
    if (options.seedBuffer instanceof Uint8Array) {
      seedBuffer = options.seedBuffer
    } else {
      throw new Error('seedBuffer must be a hex string or Uint8Array')
    }
  } else if (options.seedPhrase) {
    seedBuffer = await bip39.mnemonicToSeed(options.seedPhrase)
  } else if (options.encryptedSeed) {
    const enc = options.encryptedSeed;
    if (enc && typeof enc === 'object' && (enc.passkey || enc.salt || enc.seedBuffer)) {
      if (!enc.passkey || !enc.salt || !enc.seedBuffer) {
        throw new Error('Missing passkey, salt or encrypted seed buffer for decryption');
      }
      const secretManager = new WdkSecretManager(enc.passkey, enc.salt)
      if (!(enc.seedBuffer instanceof Uint8Array)) throw new Error('encryptedSeed.seedBuffer must be a hex string or Uint8Array')
      seedBuffer = secretManager.decrypt(enc.seedBuffer);
      secretManager.dispose();
      sodium_memzero(options.encryptedSeed.seedBuffer);
    } else {
      throw new Error('encryptedSeed parameter must be an object');
    }
  }
  if (seedBuffer) return seedBuffer;
  throw new Error('One of the following parameters must be provided: seedBuffer, seedPhrase, or encryptedSeed');
}
