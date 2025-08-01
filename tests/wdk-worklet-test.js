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

const blockchainNetwork = 'ton'

async function init () {
  console.log('init started')
  const workletStatus = await rpc.workletStart({
    enableDebugLogs: 0,
    seedPhrase: 'rack cruise mouse aspect wise model abstract acquire crack chicken defense blue',
    config: JSON.stringify(require('../chains.json')),
  })
  console.log('worklet status: ', workletStatus)

  const evmAbstractedAddress = await rpc.getAbstractedAddress({
    network: blockchainNetwork,
    accountIndex: 0,
  })
  console.log(`${blockchainNetwork} Abstracted Address:`, evmAbstractedAddress)

  const evmAbstractedBalance = await rpc.getAbstractedAddressBalance({
    network: blockchainNetwork,
    accountIndex: 0,
  })
  console.log(`${blockchainNetwork} Abstracted Balance:`, evmAbstractedBalance)

  const evmAbstractedTokenBalance = await rpc.getAbstractedAddressTokenBalance({
    network: blockchainNetwork,
    accountIndex: 0,
    tokenAddress: USDT_BALANCE_ADDRESSES[blockchainNetwork],
  })
  console.log(`${blockchainNetwork} Abstracted Token Balance:`, evmAbstractedTokenBalance)

  // const evmAbstractedAddressTransfer = await rpc.abstractedAccountTransfer({
  //   network: blockchainNetwork,
  //   accountIndex: 0,
  //   options: {
  //     token: 'test token',
  //     recipient: 'test recipient',
  //     amount: '0.10',
  //   }
  // })
}

init()
