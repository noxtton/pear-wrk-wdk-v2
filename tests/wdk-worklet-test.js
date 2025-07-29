require('../src/wdk-worklet')
const IPC = require('../src/lib/ipc').clientStream
const HRPC = require('../spec/hrpc');
const rpc = new HRPC(IPC);
// console.log(rpc)
async function init() {
  console.log('init started');
  const workletStatus = await rpc.commandWorkletStart({
    enableDebugLogs: 0,
    seedPhrase: 'rack cruise mouse aspect wise model abstract acquire crack chicken defense blue',
    config: JSON.stringify(require('../chains.json')),
  });
  console.log('worklet status: ', workletStatus);
}

init();
