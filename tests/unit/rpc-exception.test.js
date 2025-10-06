/* eslint-disable no-multiple-empty-lines */
import test from 'brittle'
import { rpcException, stringifyError } from '../../src/exceptions/rpc-exception.js'
import ERROR_CODES from '../../src/exceptions/error-codes.js'

test('stringifyError handles Error instances', (t) => {
  const err = new Error('boom')
  const s = stringifyError(err)
  t.is(typeof s, 'string')
  t.ok(s.includes('boom'))
  t.ok(s.includes('Error'))
})

test('stringifyError handles plain objects', (t) => {
  const s = stringifyError({ a: 1 })
  t.is(s, '{"a":1}')
})

test('stringifyError handles non-serializable objects', (t) => {
  const a = {}
  a.self = a
  const s = stringifyError(a)
  t.is(typeof s, 'string')
})

test('rpcException defaults when missing code/message', (t) => {
  const res = rpcException({ error: new Error('oops') })
  t.is(res.code, ERROR_CODES.UNKNOWN)
  t.is(res.message, 'Unexpected error occurred.')
  t.is(typeof res.error, 'string')
})

test('rpcException respects provided code and message', (t) => {
  const res = rpcException({ code: ERROR_CODES.BAD_REQUEST, message: 'bad', error: 'e' })
  t.is(res.code, ERROR_CODES.BAD_REQUEST)
  t.is(res.message, 'bad')
  t.is(res.error, '"e"')
})
// end

