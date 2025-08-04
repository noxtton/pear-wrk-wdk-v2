require('bare-wdk-runtime')
const { IPC } = BareKit
const HRPC = require('../spec/hrpc')
const ERROR_CODES = require('./exceptions/error-codes')

const { WdkManager } = require('../src/wdk-core/wdk-manager')
const rpcException = require('../src/exceptions/rpc-exception')

const rpc = new HRPC(IPC)
/**
 *
 * @type {WdkManager}
 */
let wdk = null

rpc.onWorkletStart(async init => {
  // console.debug('Worklet started ->', init)
  if (!wdk) wdk = new WdkManager(init.seedPhrase, JSON.parse(init.config))
  return { status: 'started' }
})

rpc.onGetAddress(async payload => {

  return { address: await wdk.getAddress(payload.network, payload.accountIndex) }
})

rpc.onGetAddressBalance(async payload => {
  const balance = await wdk.getAddressBalance(payload.network, payload.accountIndex)
  return { balance: balance.toString() }
})

rpc.onQuoteSendTransaction(async payload => {
  const transaction = await wdk.quoteSendTransaction(payload.network, payload.accountIndex, payload.options)
  return { fee: transaction.fee }
})

/*****************
 *
 * ABSTRACTION
 *
 *****************/
rpc.onGetAbstractedAddress(async payload => {
  return { address: await wdk.getAbstractedAddress(payload.network, payload.accountIndex) }
})

rpc.onGetAbstractedAddressBalance(async payload => {
  const balance = await wdk.getAbstractedAddressBalance(payload.network, payload.accountIndex)
  return { balance: balance.toString() }
})

rpc.onGetAbstractedAddressTokenBalance(async payload => {
  const balance = await wdk.getAbstractedAddressTokenBalance(payload.network, payload.accountIndex, payload.tokenAddress)
  return { balance: balance.toString() }
})

rpc.onAbstractedAccountTransfer(async payload => {
  const transfer = await wdk.abstractedAccountTransfer(payload.network, payload.accountIndex, payload.options)
  return { fee: transfer.fee }
})

rpc.onAbstractedAccountQuoteTransfer(async payload => {
  const transfer = await wdk.abstractedAccountQuoteTransfer(payload.network, payload.accountIndex, payload.options)
  return { fee: transfer.fee }
})
rpc.onDispose(() => {
  wdk.dispose()
  wdk = null
})

