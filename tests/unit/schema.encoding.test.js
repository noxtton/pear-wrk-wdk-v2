/* eslint-disable no-multiple-empty-lines */
import test from 'brittle'
import { getEnum, getEncoding, encode, decode } from '../../spec/schema/index.js'

test('log-type-enum exposes numeric mapping', (t) => {
  const e = getEnum('@wdk-core/log-type-enum')
  t.is(e.info, 1)
  t.is(e.error, 2)
  t.is(e.debug, 3)
})

test('getEncoding returns encoders for known names', (t) => {
  const names = [
    '@wdk-core/log-request',
    '@wdk-core/getAddress-request',
    '@wdk-core/getAddress-response'
  ]
  for (const n of names) {
    const enc = getEncoding(n)
    t.is(typeof enc.preencode, 'function')
    t.is(typeof enc.encode, 'function')
    t.is(typeof enc.decode, 'function')
  }
})

test('encode/decode roundtrip for getAddress-request', (t) => {
  const name = '@wdk-core/getAddress-request'
  const original = { network: 'ethereum', accountIndex: 3 }
  const buf = encode(name, original)
  const decoded = decode(name, buf)
  t.alike(decoded, original)
})

test('encode/decode handles optional flags for workletStart-request', (t) => {
  const name = '@wdk-core/workletStart-request'
  const minimal = { config: '{}' }
  const bufMinimal = encode(name, minimal)
  const decodedMinimal = decode(name, bufMinimal)
  t.is(decodedMinimal.config, '{}')
  t.is(decodedMinimal.seedPhrase, null)

  const full = { enableDebugLogs: 1, seedPhrase: 'a', seedBuffer: 'b', config: '{"x":1}' }
  const bufFull = encode(name, full)
  const decodedFull = decode(name, bufFull)
  t.alike(decodedFull, full)
})
// end

