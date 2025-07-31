const { getEnum } = require('../../spec/schema');
const logEnums = getEnum('@wdk-core/log-type-enum');
let rpc = null;
/**
 *
 * @param {logEnums} type
 * @param {string} content
 */
function sendLog(type, content) {
  rpc.commandLog({
    type: type,
    data: content,
  });
}

let enableDebugLogs = false;

function wrapConsole(rpcInstance) {
  rpc = rpcInstance;
  const logPrefix = '[WDK-CORE-WORKLET]';
  const format = (...args) =>
    args
      .map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch {
            return '[Circular]';
          }
        }
        return arg;
      })
      .join(' ');

  console.error = (...args) => {
    const content = `${logPrefix} ${format(...args)}`;
    sendLog(logEnums.error, content);
  };

  console.warn = (...args) => {
    const content = `${logPrefix} ${format(...args)}`;
    sendLog(logEnums.info, content);
  };

  console.info = (...args) => {
    const content = `${logPrefix} ${format(...args)}`;
    sendLog(logEnums.info, content);
  };
  console.debug = (...args) => {
    if (!enableDebugLogs) return;
    const content = `${logPrefix} ${format(...args)}`;
    sendLog(logEnums.debug, content);
  };
}
module.exports = wrapConsole;