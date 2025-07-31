require('bare-wdk-runtime')
const IPC = require('../src/lib/ipc').serverStream
const HRPC = require('../spec/hrpc')
const ERROR_CODES = require('./exceptions/error-codes')

const { WdkManager } = require('../src/wdk-core/wdk-manager')
const rpcException = require('../src/exceptions/rpc-exception')
const { getEncoding } = require('../spec/schema')
const wdkManager = require('../spec/hrpc')

const rpc = new HRPC(IPC)
/**
 *
 * @type {WdkManager}
 */
let wdk = null

rpc.onWorkletStart(async init => {
  // console.debug('Worklet started ->', init)
  try {
    if (!wdk) wdk = new WdkManager(init.seedPhrase, JSON.parse(init.config))
    return { status: 'started' }
  } catch (error) {
    return {
      status: 'error', exception: rpcException({
        code: ERROR_CODES.WDK_MANAGER_INIT,
        message: 'Error while initializing wdk manager',
        error: error,
      })
    }
  }
})

rpc.onGetAddress(async payload => {
  try {
    return { address: await wdk.getAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: address!.`,
        error: error,
      })
    }
  }
})

rpc.onGetAbstractedAddressBalance(async payload => {
  try {
    const balance = await wdk.getAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})

rpc.onQuoteSendTransaction(async payload => {
  try {
    let options = null
    try {
      options = JSON.parse(payload.options)
    } catch (err) {
      return {
        exception: rpcException({
          code: ERROR_CODES.BAD_REQUEST,
          message: `Error while converting options parameter json string to object.`,
          error: err,
        })
      }
    }
    const transaction = await wdk.quoteSendTransaction(payload.network, payload.accountIndex, options)
    return { fee: transaction.fee }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})



/*****************
 *
 * ABSTRACTION
 *
 *****************/
rpc.onGetAbstractedAddress(async payload => {
  try {
    return { address: await wdk.getAbstractedAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: address!.`,
        error: error,
      })
    }
  }
})

rpc.onGetAbstractedAddressBalance(async payload => {
  try {
    const balance = await wdk.getAbstractedAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})

rpc.onGetAbstractedAddressTokenBalance(async payload => {
  try {
    const balance = await wdk.getAbstractedAddressTokenBalance(payload.network, payload.accountIndex, payload.tokenAddress)
    return { balance: balance.toString() }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})

rpc.onAbstractedAccountTransfer(async payload => {
  try {
    const transfer = await wdk.abstractedAccountTransfer(payload.network, payload.accountIndex, payload.options)
    return { fee: transfer.fee }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})

rpc.onAbstractedAccountQuoteTransfer(async payload => {
  try {
    const transfer = await wdk.abstractedAccountQuoteTransfer(payload.network, payload.accountIndex, payload.options)
    return { fee: transfer.fee }
  } catch (error) {
    return {
      exception: rpcException({
        message: `Error while discovering ${payload.network}: balance!.`,
        error: error,
      })
    }
  }
})
rpc.onDispose(() => {
  wdk.dispose();
  wdk = null;
})

