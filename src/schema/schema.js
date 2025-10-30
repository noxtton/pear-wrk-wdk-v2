import ESMHyperschema from 'hyperschema'
import ESMHRPC from 'hrpc'

const SCHEMA_DIR = './spec/schema'
const HRPC_DIR = './spec/hrpc'

// register schema
const schema = ESMHyperschema.from(SCHEMA_DIR)
const schemaNs = schema.namespace('wdk-core')

schemaNs.register({
  name: 'log-type-enum',
  enum: ['info', 'error', 'debug']
})

schemaNs.register({
  name: 'log-request',
  fields: [
    { name: 'type', type: '@wdk-core/log-type-enum' },
    { name: 'data', type: 'string' }
  ]
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
    { name: 'config', type: 'string', required: true }
  ]
})

schemaNs.register({
  name: 'workletStart-response',
  fields: [
    { name: 'status', type: 'string' }
  ]
})

/**
 * wdk init
 */
schemaNs.register({
  name: 'wdkInit-request-encrypted-seed',
  fields: [
    { name: 'seedBuffer', type: 'string', required: true },
    { name: 'salt', type: 'string', required: true },
    { name: 'prf', type: 'string', required: true },
  ]
})
schemaNs.register({
  name: 'wdkInit-request',
  fields: [
    { name: 'enableDebugLogs', type: 'uint', required: false },
    { name: 'seedPhrase', type: 'string', required: false },
    { name: 'seedBuffer', type: 'string', required: false },
    { name: 'encryptedSeed', type: '@wdk-core/wdkInit-request-encrypted-seed', required: false },
    { name: 'config', type: 'string', required: true }
  ]
})

schemaNs.register({
  name: 'wdkInit-response',
  fields: [
    { name: 'status', type: 'string' }
  ]
})

/**
 * Get address based on network
 */
schemaNs.register({
  name: 'getAddress-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true }
  ]
})

schemaNs.register({
  name: 'getAddress-response',
  fields: [
    { name: 'address', type: 'string' }
  ]
})

/**
 * Get address balance based on network
 */
schemaNs.register({
  name: 'getAddressBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true }
  ]
})

schemaNs.register({
  name: 'getAddressBalance-response',
  fields: [
    { name: 'balance', type: 'string' }
  ]
})

/**
 * quoteSendTransaction
 */
schemaNs.register({
  name: 'quoteSendTransaction-request-options',
  fields: [
    { name: 'to', type: 'string', required: true },
    { name: 'value', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'quoteSendTransaction-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/quoteSendTransaction-request-options', required: true }
  ]
})

schemaNs.register({
  name: 'quoteSendTransaction-response',
  fields: [
    { name: 'fee', type: 'string' }
  ]
})

/**
 * sendTransaction
 */
schemaNs.register({
  name: 'sendTransaction-request-options',
  fields: [
    { name: 'to', type: 'string', required: true },
    { name: 'value', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'sendTransaction-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/sendTransaction-request-options', required: true }
  ]
})

schemaNs.register({
  name: 'sendTransaction-response',
  fields: [
    { name: 'fee', type: 'string' },
    { name: 'hash', type: 'string' }
  ]
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
    { name: 'accountIndex', type: 'uint', required: true }
  ]
})

schemaNs.register({
  name: 'getAbstractedAddress-response',
  fields: [
    { name: 'address', type: 'string' }
  ]
})

/**
 * Get abstracted address balance based on network
 */
schemaNs.register({
  name: 'getAbstractedAddressBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true }
  ]
})

schemaNs.register({
  name: 'getAbstractedAddressBalance-response',
  fields: [
    { name: 'balance', type: 'string' }
  ]
})

/**
 * Get abstracted address token balance based on network
 */
schemaNs.register({
  name: 'getAbstractedAddressTokenBalance-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'tokenAddress', type: 'string', required: true }
  ]
})

schemaNs.register({
  name: 'getAbstractedAddressTokenBalance-response',
  fields: [
    { name: 'balance', type: 'string' }
  ]
})

/**
 * abstractedAccountTransfer
 */
schemaNs.register({
  name: 'abstractedAccountTransfer-request-options',
  fields: [
    { name: 'token', type: 'string', required: true },
    { name: 'recipient', type: 'string', required: true },
    { name: 'amount', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'abstractedAccountTransfer-request-config-paymasterToken',
  fields: [
    { name: 'address', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'abstractedAccountTransfer-request-config',
  fields: [
    { name: 'paymasterToken', type: '@wdk-core/abstractedAccountTransfer-request-config-paymasterToken', required: false }
  ]
})
schemaNs.register({
  name: 'abstractedAccountTransfer-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/abstractedAccountTransfer-request-options', required: true },
    { name: 'config', type: '@wdk-core/abstractedAccountTransfer-request-config', required: false }
  ]
})

schemaNs.register({
  name: 'abstractedAccountTransfer-response',
  fields: [
    { name: 'hash', type: 'string' },
    { name: 'fee', type: 'string' }
  ]
})

/**
 * getApproveTransaction
 */
schemaNs.register({
  name: 'getApproveTransaction-request',
  fields: [
    { name: 'token', type: 'string', required: true },
    { name: 'recipient', type: 'string', required: true },
    { name: 'amount', type: 'string', required: true }
  ]
})

schemaNs.register({
  name: 'getApproveTransaction-response',
  fields: [
    { name: 'to', type: 'string', required: true },
    { name: 'value', type: 'string', required: true },
    { name: 'data', type: 'string', required: true }
  ]
})

/**
 * abstractedSendTransaction
 */
schemaNs.register({
  name: 'abstractedSendTransaction-request-config-paymasterToken',
  fields: [
    { name: 'address', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'abstractedSendTransaction-request-config',
  fields: [
    { name: 'paymasterToken', type: '@wdk-core/abstractedSendTransaction-request-config-paymasterToken', required: false }
  ]
})
schemaNs.register({
  name: 'abstractedSendTransaction-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: 'string', required: true },
    { name: 'config', type: '@wdk-core/abstractedSendTransaction-request-config', required: false }
  ]
})

schemaNs.register({
  name: 'abstractedSendTransaction-response',
  fields: [
    { name: 'hash', type: 'string' },
    { name: 'fee', type: 'string' }
  ]
})

/**
 * abstractedAccountQuoteTransfer
 */
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request-options',
  fields: [
    { name: 'token', type: 'string', required: true },
    { name: 'recipient', type: 'string', required: true },
    { name: 'amount', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request-config-paymasterToken',
  fields: [
    { name: 'address', type: 'string', required: true }
  ]
})
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request-config',
  fields: [
    { name: 'paymasterToken', type: '@wdk-core/abstractedAccountQuoteTransfer-request-config-paymasterToken', required: false }
  ]
})
schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'options', type: '@wdk-core/abstractedAccountQuoteTransfer-request-options', required: true },
    { name: 'config', type: '@wdk-core/abstractedAccountQuoteTransfer-request-config', required: false }
  ]
})

schemaNs.register({
  name: 'abstractedAccountQuoteTransfer-response',
  fields: [
    { name: 'fee', type: 'string' }
  ]
})

schemaNs.register({
  name: 'getTransactionReceipt-request',
  fields: [
    { name: 'network', type: 'string', required: true },
    { name: 'accountIndex', type: 'uint', required: true },
    { name: 'hash', type: 'string', required: true }
  ]
})

schemaNs.register({
  name: 'getTransactionReceipt-response',
  fields: [
    { name: 'receipt', type: 'string' }
  ]
})



/**
 * GenerateAndEncrypt
 */

schemaNs.register({
	name: 'generateAndEncrypt-request',
	fields: [
		{ name: 'passkey', type: 'string' },
		{ name: 'salt', type: 'string' },
		{ name: 'seedPhrase', type: 'string', required: false },
		{ name: 'derivedKey', type: 'string', required: false },
	],
});

schemaNs.register({
	name: 'generateAndEncrypt-response',
	fields: [
		{ name: 'encryptedEntropy', type: 'string' },
		{ name: 'encryptedSeed', type: 'string' },
	],
});


/**
 * Decrypt
 */

schemaNs.register({
	name: 'decrypt-request',
	fields: [
		{ name: 'passkey', type: 'string' },
		{ name: 'salt', type: 'string' },
		{ name: 'encryptedData', type: 'string' },
		{ name: 'derivedKey', type: 'string', required: false },
	],
});

schemaNs.register({
	name: 'decrypt-response',
	fields: [{ name: 'result', type: 'string' }],
});


/**
 * Generate Seed
 */

schemaNs.register({
	name: 'generateSeed-request',
	fields: [],
});

schemaNs.register({
	name: 'generateSeed-response',
	fields: [{ name: 'mnemonic', type: 'string' }],
});

/**
 * Dispose
 */

schemaNs.register({
  name: 'dispose-request',
  fields: []
})

ESMHyperschema.toDisk(schema)

// Load and build interface
const builder = ESMHRPC.from(SCHEMA_DIR, HRPC_DIR)
const ns = builder.namespace('wdk-core')

// Register commands
ns.register({
  name: 'log',
  request: { name: '@wdk-core/log-request', send: true }
})

ns.register({
  name: 'workletStart',
  request: { name: '@wdk-core/workletStart-request', stream: false },
  response: { name: '@wdk-core/workletStart-response', stream: false }
})

ns.register({
  name: 'wdkInit',
  request: { name: '@wdk-core/wdkInit-request', stream: false },
  response: { name: '@wdk-core/wdkInit-response', stream: false }
})

ns.register({
  name: 'getAddress',
  request: { name: '@wdk-core/getAddress-request', stream: false },
  response: { name: '@wdk-core/getAddress-response', stream: false }
})

ns.register({
  name: 'getAddressBalance',
  request: { name: '@wdk-core/getAddressBalance-request', stream: false },
  response: { name: '@wdk-core/getAddressBalance-response', stream: false }
})

ns.register({
  name: 'quoteSendTransaction',
  request: { name: '@wdk-core/quoteSendTransaction-request', stream: false },
  response: { name: '@wdk-core/quoteSendTransaction-response', stream: false }
})

ns.register({
  name: 'sendTransaction',
  request: { name: '@wdk-core/sendTransaction-request', stream: false },
  response: { name: '@wdk-core/sendTransaction-response', stream: false }
})

ns.register({
  name: 'getAbstractedAddress',
  request: { name: '@wdk-core/getAbstractedAddress-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddress-response', stream: false }
})

ns.register({
  name: 'getAbstractedAddressBalance',
  request: { name: '@wdk-core/getAbstractedAddressBalance-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddressBalance-response', stream: false }
})

ns.register({
  name: 'getAbstractedAddressTokenBalance',
  request: { name: '@wdk-core/getAbstractedAddressTokenBalance-request', stream: false },
  response: { name: '@wdk-core/getAbstractedAddressTokenBalance-response', stream: false }
})
ns.register({
  name: 'abstractedAccountTransfer',
  request: { name: '@wdk-core/abstractedAccountTransfer-request', stream: false },
  response: { name: '@wdk-core/abstractedAccountTransfer-response', stream: false }
})
ns.register({
  name: 'getApproveTransaction',
  request: { name: '@wdk-core/getApproveTransaction-request', stream: false },
  response: { name: '@wdk-core/getApproveTransaction-response', stream: false }
})
ns.register({
  name: 'abstractedSendTransaction',
  request: { name: '@wdk-core/abstractedSendTransaction-request', stream: false },
  response: { name: '@wdk-core/abstractedSendTransaction-response', stream: false }
})
ns.register({
  name: 'abstractedAccountQuoteTransfer',
  request: { name: '@wdk-core/abstractedAccountQuoteTransfer-request', stream: false },
  response: { name: '@wdk-core/abstractedAccountQuoteTransfer-response', stream: false }
})
ns.register({
  name: 'getTransactionReceipt',
  request: { name: '@wdk-core/getTransactionReceipt-request', stream: false },
  response: { name: '@wdk-core/getTransactionReceipt-response', stream: false }
})
ns.register({
  name: 'dispose',
  request: { name: '@wdk-core/dispose-request', send: true }
})

ns.register({
	name: 'generateAndEncrypt',
	request: { name: '@wdk-core/generateAndEncrypt-request', stream: false },
	response: { name: '@wdk-core/generateAndEncrypt-response', stream: false },
});

ns.register({
	name: 'decrypt',
	request: { name: '@wdk-core/decrypt-request', stream: false },
	response: { name: '@wdk-core/decrypt-response', stream: false },
});

ns.register({
	name: 'generateSeed',
	request: { name: '@wdk-core/generateSeed-request', stream: false },
	response: { name: '@wdk-core/generateSeed-response', stream: false },
});
// Save interface to disk
ESMHRPC.toDisk(builder)
