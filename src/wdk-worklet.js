require('bare-wdk-runtime')
const IPC = require('../src/lib/ipc').serverStream
const HRPC = require('../spec/hrpc')
const ERROR_CODES = require('./exceptions/error-codes')

const { WdkManager } = require('../src/wdk-core/wdk-manager')
const rpcException = require('../src/exceptions/rpc-exception')

const rpc = new HRPC(IPC)

let wdk = null

rpc.onCommandWorkletStart(async init => {
  console.debug('Worklet started ->', init)
  try {
    if (!wdk) wdk = new WdkManager(init.seedPhrase, JSON.parse(init.config))
  } catch (error) {
    return {
      status: 'error', exception: rpcException({
        code: ERROR_CODES.WDK_MANAGER_INIT,
        message: 'Error while initializing wdk manager',
        error: error,
      })
    }
  }
  return { status: 'started' }
})