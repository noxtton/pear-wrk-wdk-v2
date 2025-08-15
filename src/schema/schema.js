const Hyperschema = require('hyperschema')
const HRPCBuilder = require('hrpc')

const SCHEMA_DIR = './spec/schema'
const HRPC_DIR = './spec/hrpc'

// register schema
const schema = Hyperschema.from(SCHEMA_DIR)
const schemaNs = schema.namespace('wdk-core')

schemaNs.register({
  name: 'log-type-enum',
  enum: ['info', 'error', 'debug'],
})

schemaNs.register({
  name: 'log-request',
  fields: [
    { name: 'type', type: '@wdk-core/log-type-enum' },
    { name: 'data', type: 'string' },
  ],
})

/**
 * Worklet start
 */
schemaNs.register({
  name: 'workletStart-request',
  fields: [
    { name: 'enableDebugLogs', type: 'uint', required: false },
    { name: 'seedPhrase', type: 'string', required: false },
    { name: 'seedBuffer', type: 'string', required: false },
    { name: 'config', type: 'string', required: true },
  ],
})

schemaNs.register({
  name: 'workletStart-response',
  fields: [
    { name: 'status', type: 'string' }
  ],
})


/**
 * Get address based on network
 */
schemaNs.register({
  name: 'getAddress-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true }
  ],
})

schemaNs.register({
  name: 'getAddress-response',
  fields: [
    { name: 'address', type: 'string' },
  ],
})

/**
 * Get address balance based on network
 */
schemaNs.register({
  name: 'getAddressBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true }
  ],
})

schemaNs.register({
  name: 'getAddressBalance-response',
  fields: [
    { name: 'balance', type: 'string' }
  ],
})

/**
 * quoteSendTransaction
 */
schemaNs.register({
  name: 'quoteSendTransaction-request-options',
  fields: [
    { name: 'to', type: 'string', required: true },
    { name: 'value', type: 'uint', required: true }
  ],
})
schemaNs.register({
  name: 'quoteSendTransaction-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/quoteSendTransaction-request-options', required: true },
  ],
})

schemaNs.register({
  name: 'quoteSendTransaction-response',
  fields: [
    { name: 'fee', type: 'uint' }
  ],
})

/********************
 *
 * ABSTRACTION
 *
 *******************/
/**
 * Get abstracted address based on network
 */
schemaNs.register({
  name: 'getAbstractedAddress-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
  ],
})

schemaNs.register({
  name: 'getAbstractedAddress-response',
  fields: [
    { name: 'address', type: 'string' }
  ],
})

/**
 * Get abstracted address balance based on network
 */
schemaNs.register({
  name: 'getAbstractedAddressBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
  ],
})

schemaNs.register({
  name: 'getAbstractedAddressBalance-response',
  fields: [
    { name: 'balance', type: 'uint' }
  ],
})

/**
 * Get abstracted address token balance based on network
 */
schemaNs.register({
  name: 'getAbstractedAddressTokenBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'tokenAddress', type: 'string', required: true },
  ],
})

schemaNs.register({
  name: 'getAbstractedAddressTokenBalance-response',
  fields: [
    { name: 'balance', type: 'uint' }
  ],
})

/**
 * abstractedAccountTransfer
 */
schemaNs.register({
  name: 'abstractedAccountTransfer-request-options',
  fields: [
    { name: 'token', type: 'string', required: true },
    { name: 'recipient', type: 'string', required: true },
    { name: 'amount', type: 'uint', required: true },
  ],
})
schemaNs.register({
  name: 'abstractedAccountTransfer-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/abstractedAccountTransfer-request-options', required: true },
  ],
})

schemaNs.register({
  name: 'abstractedAccountTransfer-response',
  fields: [
    { name: 'hash', type: 'string' },
    { name: 'fee', type: 'uint' }
  ],
})

/**
 * abstractedAccountQuoteTransfer
 */
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request-options',
  fields: [
    { name: 'token', type: 'string', required: true },
    { name: 'recipient', type: 'string', required: true },
    { name: 'amount', type: 'uint', required: true },
  ],
})
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/abstractedAccountQuoteTransfer-request-options', required: true },
  ],
})

schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-response',
  fields: [
    { name: 'fee', type: 'uint' }
  ],
})

schemaNs.register({
  name: 'dispose-request',
  fields: [],
});

Hyperschema.toDisk(schema)

// Load and build interface
const builder = HRPCBuilder.from(SCHEMA_DIR, HRPC_DIR)
const ns = builder.namespace('wdk-core')

// Register commands
ns.register({
  name: 'log',
  request: { name: '@wdk-core/log-request', send: true },
})

ns.register({
  name: 'workletStart',
  request: { name: '@wdk-core/workletStart-request', stream: false },
  response: { name: '@wdk-core/workletStart-response', stream: false },
})

ns.register({
  name: 'getAddress',
  request: { name: '@wdk-core/getAddress-request', stream: false },
  response: { name: '@wdk-core/getAddress-response', stream: false },
})

ns.register({
  name: 'getAddressBalance',
  request: { name: '@wdk-core/getAddressBalance-request', stream: false },
  response: { name: '@wdk-core/getAddressBalance-response', stream: false },
})

ns.register({
  name: 'quoteSendTransaction',
  request: { name: '@wdk-core/quoteSendTransaction-request', stream: false },
  response: { name: '@wdk-core/quoteSendTransaction-response', stream: false },
})

ns.register({
  name: 'getAbstractedAddress',
  request: { name: '@wdk-core/getAbstractedAddress-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddress-response', stream: false },
})

ns.register({
  name: 'getAbstractedAddressBalance',
  request: { name: '@wdk-core/getAbstractedAddressBalance-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddressBalance-response', stream: false },
})

ns.register({
  name: 'getAbstractedAddressTokenBalance',
  request: { name: '@wdk-core/getAbstractedAddressTokenBalance-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddressTokenBalance-response', stream: false },
})
ns.register({
  name: 'abstractedAccountTransfer',
  request: { name: '@wdk-core/abstractedAccountTransfer-request', stream: false },
  response: { name: '@wdk-core/abstractedAccountTransfer-response', stream: false },
})
ns.register({
  name: 'abstractedAccountQuoteTransfer',
  request: { name: '@wdk-core/abstractedAccountQuoteTransfer-request', stream: false },
  response: { name: '@wdk-core/abstractedAccountQuoteTransfer-response', stream: false },
})
ns.register({
  name: 'dispose',
  request: { name: '@wdk-core/dispose-request', send: true },
});
// Save interface to disk
HRPCBuilder.toDisk(builder)
