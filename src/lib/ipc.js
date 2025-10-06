import IPC from 'bare-ipc'
/**
 * bare-ipc: need for create bareKit link environment to use IPC with HRPC
 * bare-ipc gives us two pear of ports:
 * {input: x output: y} as a portA
 * {input: x output: y} as a portB
 * the portA instance should be used inside on the server side for example (worklet).
 * and the portB instance should be used on the client side, for example, on a mobile application side file.
 */
const [portA, portB] = IPC.open()
const serverStream = portA.connect()
serverStream.ref()
const clientStream = portB.connect()
clientStream.ref()

export {
  serverStream,
  clientStream
}
