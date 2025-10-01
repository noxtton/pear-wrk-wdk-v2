const { IPC } = BareKit

import HRPC from '../spec/hrpc';

import { WdkManager } from './wdk-core/wdk-manager.js';
import { stringifyError } from '../src/exceptions/rpc-exception';


const rpc = new HRPC(IPC)
/**
 *
 * @type {WdkManager}
 */
let wdk = null

rpc.onWorkletStart(async init => {
  try {
    if (wdk) wdk.dispose() // cleanup existing;
    wdk = new WdkManager(init.seedPhrase, JSON.parse(init.config))
    return { status: 'started' }
  } catch (error) {
    throw new Error(stringifyError(error))
  }

})