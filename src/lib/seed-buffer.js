import b4a from 'b4a'
import bip39 from 'bip39'

/**
 *
 * @param {string} seedBufferHex - 64 bytes seed buffer in hex format
 * @param {string} seedPhrase - 12 or 24 words mnemonic seed phrase
 * @return {Uint8Array<ArrayBufferLike>}
 */
export async function getSeedBuffer (seedBufferHex = null, seedPhrase = null) {
  if (seedBufferHex) {
    return b4a.from(seedBufferHex, 'hex')
  } else {
    return await bip39.mnemonicToSeed(seedPhrase)
  }
}
