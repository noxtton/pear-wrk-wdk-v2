/* eslint-disable */
/* eslint-disable no-multiple-empty-lines */
import test from 'brittle'
import HRPC from '../../spec/hrpc/index.js'

class FakeRequest {
  constructor (responseBuffer) {
    this._responseBuffer = responseBuffer
    this.sent = null
  }

  send (buf) {
    this.sent = buf
  }

  async reply () {
    return this._responseBuffer
  }
}

class FakeRPC {
  constructor () {
    this.lastRequested = null
    this._responseBuffer = new Uint8Array(0)
    this._lastRequestObj = null
  }

  request (id) {
    this.lastRequested = id
    this._lastRequestObj = new FakeRequest(this._responseBuffer)
    return this._lastRequestObj
  }
}

function attachMethods (obj) {
  obj._call = HRPC.prototype._call.bind(obj)
  obj._callSync = HRPC.prototype._callSync.bind(obj)
  obj._requestIsSend = HRPC.prototype._requestIsSend.bind(obj)
  obj._requestIsStream = HRPC.prototype._requestIsStream.bind(obj)
  obj._responseIsStream = HRPC.prototype._responseIsStream.bind(obj)
  obj.log = HRPC.prototype.log.bind(obj)
  obj.workletStart = HRPC.prototype.workletStart.bind(obj)
  obj.getAddress = HRPC.prototype.getAddress.bind(obj)
  obj.getAddressBalance = HRPC.prototype.getAddressBalance.bind(obj)
  obj.quoteSendTransaction = HRPC.prototype.quoteSendTransaction.bind(obj)
  obj.sendTransaction = HRPC.prototype.sendTransaction.bind(obj)
  obj.getAbstractedAddress = HRPC.prototype.getAbstractedAddress.bind(obj)
  obj.getAbstractedAddressBalance = HRPC.prototype.getAbstractedAddressBalance.bind(obj)
  obj.getAbstractedAddressTokenBalance = HRPC.prototype.getAbstractedAddressTokenBalance.bind(obj)
  obj.abstractedAccountTransfer = HRPC.prototype.abstractedAccountTransfer.bind(obj)
  obj.getApproveTransaction = HRPC.prototype.getApproveTransaction.bind(obj)
  obj.abstractedSendTransaction = HRPC.prototype.abstractedSendTransaction.bind(obj)
  obj.abstractedAccountQuoteTransfer = HRPC.prototype.abstractedAccountQuoteTransfer.bind(obj)
  obj.getTransactionReceipt = HRPC.prototype.getTransactionReceipt.bind(obj)
  obj.dispose = HRPC.prototype.dispose.bind(obj)
}

function makeDummyRequestEncoder (capture) {
  return {
    preencode (_state, m) { capture.value = m },
    encode () {},
    decode () { return null }
  }
}

function makeDummyResponseEncoder (result) {
  return {
    preencode () {},
    encode () {},
    decode () { return result }
  }
}

test('HRPC request/response commands encode and decode via maps', async (t) => {
  const rpc = new FakeRPC()
  const h = { _rpc: rpc, _requestEncodings: new Map(), _responseEncodings: new Map() }
  attachMethods(h)

  const cases = [
    { name: '@wdk-core/workletStart', method: () => h.workletStart({ config: '{}' }), req: { config: '{}' }, res: { status: 'ok' } },
    { name: '@wdk-core/getAddress', method: () => h.getAddress({ network: 'ethereum', accountIndex: 0 }), req: { network: 'ethereum', accountIndex: 0 }, res: { address: '0xabc' } },
    { name: '@wdk-core/getAddressBalance', method: () => h.getAddressBalance({ network: 'tron', accountIndex: 1 }), req: { network: 'tron', accountIndex: 1 }, res: { balance: '123' } },
    { name: '@wdk-core/quoteSendTransaction', method: () => h.quoteSendTransaction({ network: 'ethereum', accountIndex: 0, options: { to: '0x1', value: '1' } }), req: { network: 'ethereum', accountIndex: 0, options: { to: '0x1', value: '1' } }, res: { fee: '10' } },
    { name: '@wdk-core/sendTransaction', method: () => h.sendTransaction({ network: 'ethereum', accountIndex: 0, options: { to: '0x1', value: '1' } }), req: { network: 'ethereum', accountIndex: 0, options: { to: '0x1', value: '1' } }, res: { fee: '10', hash: '0xdead' } },
    { name: '@wdk-core/getAbstractedAddress', method: () => h.getAbstractedAddress({ network: 'ethereum', accountIndex: 0 }), req: { network: 'ethereum', accountIndex: 0 }, res: { address: '0xdef' } },
    { name: '@wdk-core/getAbstractedAddressBalance', method: () => h.getAbstractedAddressBalance({ network: 'ethereum', accountIndex: 0 }), req: { network: 'ethereum', accountIndex: 0 }, res: { balance: '5' } },
    { name: '@wdk-core/getAbstractedAddressTokenBalance', method: () => h.getAbstractedAddressTokenBalance({ network: 'ethereum', accountIndex: 0, tokenAddress: '0x2' }), req: { network: 'ethereum', accountIndex: 0, tokenAddress: '0x2' }, res: { balance: '7' } },
    { name: '@wdk-core/abstractedAccountTransfer', method: () => h.abstractedAccountTransfer({ network: 'ethereum', accountIndex: 0, options: { token: '0x3', recipient: '0x4', amount: '1' } }), req: { network: 'ethereum', accountIndex: 0, options: { token: '0x3', recipient: '0x4', amount: '1' } }, res: { hash: '0xbeef', fee: '2' } },
    { name: '@wdk-core/getApproveTransaction', method: () => h.getApproveTransaction({ token: '0x3', recipient: '0x4', amount: '1' }), req: { token: '0x3', recipient: '0x4', amount: '1' }, res: { to: '0x3', value: '0', data: '0x00' } },
    { name: '@wdk-core/abstractedSendTransaction', method: () => h.abstractedSendTransaction({ network: 'ethereum', accountIndex: 0, options: '[]' }), req: { network: 'ethereum', accountIndex: 0, options: '[]' }, res: { hash: '0x1', fee: '3' } },
    { name: '@wdk-core/abstractedAccountQuoteTransfer', method: () => h.abstractedAccountQuoteTransfer({ network: 'ethereum', accountIndex: 0, options: { token: '0x3', recipient: '0x4', amount: '1' } }), req: { network: 'ethereum', accountIndex: 0, options: { token: '0x3', recipient: '0x4', amount: '1' } }, res: { fee: '9' } },
    { name: '@wdk-core/getTransactionReceipt', method: () => h.getTransactionReceipt({ network: 'ethereum', accountIndex: 0, hash: '0x1' }), req: { network: 'ethereum', accountIndex: 0, hash: '0x1' }, res: { receipt: 'ok' } }
  ]

  for (const cse of cases) {
    const capture = { value: null }
    h._requestEncodings.set(cse.name, makeDummyRequestEncoder(capture))
    h._responseEncodings.set(cse.name, makeDummyResponseEncoder(cse.res))

    const out = await cse.method()
    t.alike(out, cse.res)
    t.alike(capture.value, cse.req)
  }
})

test('HRPC send-only commands encode and send', (t) => {
  const rpc = new FakeRPC()
  const h = { _rpc: rpc, _requestEncodings: new Map(), _responseEncodings: new Map() }
  attachMethods(h)

  const sendCases = [
    { name: '@wdk-core/log', call: () => h.log({ type: 1, data: 'hello' }), req: { type: 1, data: 'hello' } },
    { name: '@wdk-core/dispose', call: () => h.dispose({}), req: {} }
  ]

  for (const cse of sendCases) {
    const capture = { value: null }
    h._requestEncodings.set(cse.name, makeDummyRequestEncoder(capture))
    h._responseEncodings.set(cse.name, makeDummyResponseEncoder(null))

    const res = cse.call()
    t.is(res, undefined)
    t.alike(capture.value, cse.req)
    t.ok(rpc._lastRequestObj && rpc._lastRequestObj.sent !== null)
  }
})


