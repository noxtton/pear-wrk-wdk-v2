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
  try {
    const workletStatus = await rpc.workletStart({
      enableDebugLogs: 0,
      seedPhrase: 'clump cherry rural carry lazy blade gain high holiday point witness when',
      // seedPhrase: 'rack cruise mouse aspect wise model abstract acquire crack chicken defense blue',
      config: JSON.stringify(require('../chains.json')),
    })
    console.log('worklet status: ', workletStatus)
  } catch (error) {
    console.log(error)
  }

  // try {
  //   const fee = await rpc.abstractedAccountQuoteTransfer({
  //     network: 'polygon',
  //     accountIndex: 0,
  //     options: {
  //       token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  //       recipient: '0xd35AaD5aa98a5FB0d7F399d3D90Bb4715F230F3B',
  //       amount: 1000,
  //     }
  //   })
  //   console.log('abstractedAccountQuoteTransfer', fee);
  // }catch (e) {
  //   console.log(e);
  // }
  // //
  // try {
  //   const tresult = await rpc.abstractedAccountTransfer({
  //     network: 'polygon',
  //     accountIndex: 0,
  //     options: {
  //       token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  //       recipient: '0xd35AaD5aa98a5FB0d7F399d3D90Bb4715F230F3B',
  //       amount: 10000,
  //     }
  //   })
  //   console.log('abstractedAccountTransfer', tresult);
  // }catch (e) {
  //   console.log(e);
  // }

  // try {
  //   const btcAddress = await rpc.getAddress({
  //     network: 'bitcoin',
  //     accountIndex: 0,
  //   })
  //   console.log(`bitcoin Address:`, btcAddress)
  // } catch (error) {
  //   console.log(error)
  // }
  //
  // try {
  //   const btcBalance = await rpc.getAddressBalance({
  //     network: 'bitcoin',
  //     accountIndex: 0,
  //   })
  //   console.log(`bitcoin balance:`, btcBalance)
  // } catch (error) {
  //   console.log(error)
  // }
  //
  // try {
  //   const fee = await rpc.quoteSendTransaction({
  //     network: 'bitcoin',
  //     accountIndex: 0,
  //     options: {
  //       to: 'bc1quadg5axzx85enul0sf2se2yplmkfglfkddzeut',
  //       value: 1000,
  //     }
  //   })
  //   console.log('abstractedAccountQuoteTransfer', fee);
  // }catch (e) {
  //   console.log(e);
  // }

  // try {
  //   const btctx = await rpc.sendTransaction({
  //     network: 'bitcoin',
  //     accountIndex: 0,
  //     options: {
  //       to: 'bc1quadg5axzx85enul0sf2se2yplmkfglfkddzeut',
  //       value: 1000,
  //     }
  //   })
  //   console.log('transaction', btctx);
  // }catch (e) {
  //   console.log(e);
  // }

  // try {
  //   const evmAbstractedAddress = await rpc.getAbstractedAddress({
  //     network: 'polygon',
  //     accountIndex: 0,
  //   })
  //   console.log(`polygon Abstracted Address:`, evmAbstractedAddress)
  // } catch (error) {
  //   console.log(error)
  // }

  // try {
  //   const receipt = await rpc.getTransactionReceipt({
  //     network: 'polygon',
  //     accountIndex: 0,
  //     hash: '0xafd9d7f2024ca6ece74a1bf7c593e9f914210f911207ecccd43eadabce7a8824'
  //   })
  //   console.log(`receipt:`, receipt)
  // } catch (error) {
  //   console.log(error)
  // }

  // try {
  //   const evmAbstractedBalance = await rpc.getAbstractedAddressBalance({
  //     network: blockchainNetwork,
  //     accountIndex: 0,
  //   })
  //   console.log(`${blockchainNetwork} Abstracted Balance:`, evmAbstractedBalance)
  // } catch (error) {
  //   console.log(error)
  // }
  //
  // try {
  //   const evmAbstractedTokenBalance = await rpc.getAbstractedAddressTokenBalance({
  //     network: blockchainNetwork,
  //     accountIndex: 0,
  //     tokenAddress: USDT_BALANCE_ADDRESSES[blockchainNetwork],
  //   })
  //   console.log(`${blockchainNetwork} Abstracted Token Balance:`, evmAbstractedTokenBalance)
  // } catch (e) {
  //   console.log(e)
  // }

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
