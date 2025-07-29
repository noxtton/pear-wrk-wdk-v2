const Hyperschema = require('hyperschema');
const HRPCBuilder = require('hrpc');

const SCHEMA_DIR = './spec/schema';
const HRPC_DIR = './spec/hrpc';

// register schema
const schema = Hyperschema.from(SCHEMA_DIR);
const schemaNs = schema.namespace('wdk-core');

schemaNs.register({
  name: 'command-workletStart-request',
  fields: [
    { name: 'enableDebugLogs', type: 'uint', required: false },
    { name: 'seedPhrase', type: 'string', required: false },
    { name: 'seedBuffer', type: 'string', required: false },
    { name: 'config', type: 'string', required: true },
  ],
});

schemaNs.register({
  name: 'command-workletStart-response',
  fields: [
    { name: 'status', type: 'string' },
    {name: 'exception', type: 'string', required: false }
  ],
});

schemaNs.register({
  name: 'command-workletStop-request',
  fields: [{ name: 'payload', type: 'string', required: false }],
});

schemaNs.register({
  name: 'command-workletStop-response',
  fields: [{ name: 'status', type: 'string' }],
});

Hyperschema.toDisk(schema);

// Load and build interface
const builder = HRPCBuilder.from(SCHEMA_DIR, HRPC_DIR);
const ns = builder.namespace('wdk-core');

// Register commands

ns.register({
  name: 'command-workletStart',
  request: { name: '@wdk-core/command-workletStart-request', stream: false },
  response: { name: '@wdk-core/command-workletStart-response', stream: false },
});

ns.register({
  name: 'command-workletStop',
  request: { name: '@wdk-core/command-workletStop-request', stream: false },
  response: { name: '@wdk-core/command-workletStop-response', stream: false },
});
// Save interface to disk
HRPCBuilder.toDisk(builder);
