global.BareKit = { IPC: require('../src/lib/ipc').serverStream }
require('../src/wdk-worklet')
const IPC = require('../src/lib/ipc').clientStream
const HRPC = require('../spec/hrpc')
const rpc = new HRPC(IPC)

const USDT_BALANCE_ADDRESSES = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  polygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  arbitrum: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  ton: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
}

const XAUT_BALANCE_ADDRESSES = {
  ethereum: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
  polygon: '0xF1815bd50389c46847f0Bda824eC8da914045D14',
  arbitrum: '0x40461291347e1eCbb09499F3371D3f17f10d7159',
  ton: 'EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k',
}

async function init () {
  console.log('init started')
  try {
    const workletStatus = await rpc.workletStart({
      enableDebugLogs: 0,
      seedPhrase: 'shed damage whale suffer better frozen sphere help old wise combine crawl',
      config: JSON.stringify(require('../chains.json')),
    })
    console.log('worklet status: ', workletStatus)
  } catch (error) {
    console.log(error)
  }

  try {
    const btcAddress = await rpc.getAddress({
      network: 'bitcoin',
      accountIndex: 0,
    })
    console.log(`bitcoin Address:`, btcAddress)
  } catch (error) {
    console.log(error)
  }

  try {
    const ethereum = await rpc.getAbstractedAddress({
      network: 'ethereum',
      accountIndex: 0,
    })
    console.log(`ethereum Abstracted Address:`, ethereum)
  } catch (error) {
    console.log(error)
  }

  try {
    const polygon = await rpc.getAbstractedAddress({
      network: 'polygon',
      accountIndex: 0,
    })
    console.log(`polygon Abstracted Address:`, polygon)
  } catch (error) {
    console.log(error)
  }

  try {
    const arbitrum = await rpc.getAbstractedAddress({
      network: 'arbitrum',
      accountIndex: 0,
    })
    console.log(`arbitrum Abstracted Address:`, arbitrum)
  } catch (error) {
    console.log(error)
  }

  try {
    const ton = await rpc.getAbstractedAddress({
      network: 'ton',
      accountIndex: 0,
    })
    console.log(`ton Abstracted Address:`, ton)
  } catch (error) {
    console.log(error)
  }

  try {
    const ton = await rpc.getAddress({
      network: 'ton',
      accountIndex: 0,
    })
    console.log(`ton Address:`, ton)
  } catch (error) {
    console.log(error)
  }

}

init();