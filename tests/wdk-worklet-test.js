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
  //     network: 'ton',
  //     accountIndex: 0,
  //     options: {
  //       token: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
  //       recipient: 'UQD3pGcepS4RffO1iktLhpucHEXWJhG-U_MjtmLgzB0z7rBw',
  //       amount: 1000,
  //     }
  //   })
  //   console.log('abstractedAccountQuoteTransfer', fee);
  // }catch (e) {
  //   console.log(e);
  // }

  // try {
  //   const fee = await rpc.quoteSendTransaction({
  //     network: 'ton',
  //     accountIndex: 0,
  //     options: {
  //       to: 'UQDucbdxXlbsgMvse4SStKOd4ZGBQ2Km_FCEgJqAnQEZrEVD',
  //       value: 1000,
  //     }
  //   })
  //   console.log('abstractedAccountQuoteTransfer', fee);
  // }catch (e) {
  //   console.log(e);
  // }
  //
  // try {
  //   const polygonSendTransaction = await rpc.abstractedSendTransaction({
  //     network: 'polygon',
  //     accountIndex: 0,
  //     options: JSON.stringify([{
  //       to: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  //       value: 0,
  //       data: '0xa9059cbb0000000000000000000000002f878a4a33d30001010b324892a7542a6ef0fc600000000000000000000000000000000000000000000000000000000000007530'
  //     }]),
  //   })
  //   console.log('abstractedSendTransaction', polygonSendTransaction)
  // } catch (e) {
  //   console.log(e)
  // }

  // try {
  //   const fee = await rpc.abstractedAccountQuoteTransfer({
  //     network: 'ethereum',
  //     accountIndex: 0,
  //     options: {
  //       token: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
  //       recipient: '0x6a5f608ae4b1abdd030E79d0f9a47c5443545E1E',
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
  //       token: USDT_BALANCE_ADDRESSES['polygon'],
  //       recipient: '0x2f878A4a33D30001010b324892A7542a6eF0fC60',
  //       amount: 30000,
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
  //       value: "1000",
  //     }
  //   })
  //   console.log('quoteSendTransaction', fee);
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
  //
  // try {
  //   const receipt = await rpc.getTransactionReceipt({
  //     network: 'polygon',
  //     accountIndex: 0,
  //     hash: '0x457eeb1d52a549fa45f8e93b3677437992dfbcb8115289d7395a8ef10ba1ca98'
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
  //     network: 'polygon',
  //     accountIndex: 0,
  //     tokenAddress: USDT_BALANCE_ADDRESSES['polygon'],
  //   })
  //   console.log(`polygon Abstracted Token Balance:`, evmAbstractedTokenBalance)
  // } catch (e) {
  //   console.log(e)
  // }

  // try {
  //   const evmAbstractedTokenBalance = await rpc.getAbstractedAddressTokenBalance({
  //     network: 'ethereum',
  //     accountIndex: 0,
  //     tokenAddress: XAUT_BALANCE_ADDRESSES['ethereum'],
  //   })
  //   console.log(`ethereum Abstracted Token Balance:`, evmAbstractedTokenBalance)
  // } catch (e) {
  //   console.log(e)
  // }

  // try {
  //   const evmAbstractedTokenBalance = await rpc.getAbstractedAddressTokenBalance({
  //     network: 'ethereum',
  //     accountIndex: 0,
  //     tokenAddress: XAUT_BALANCE_ADDRESSES['ethereum'],
  //   })
  //   console.log(`ethereum Abstracted Token Balance:`, evmAbstractedTokenBalance)
  // } catch (e) {
  //   console.log(e)
  // }
  //
  // try {
  //   const fee = await rpc.abstractedAccountQuoteTransfer({
  //     network: 'ton',
  //     accountIndex: 0,
  //     options: {
  //       token: USDT_BALANCE_ADDRESSES['ton'],
  //       recipient: 'UQD3pGcepS4RffO1iktLhpucHEXWJhG-U_MjtmLgzB0z7rBw',
  //       amount: "100",
  //     }
  //   })
  //   console.log('abstractedAccountQuoteTransfer', fee);
  // }catch (e) {
  //   console.log(e);
  // }

  // try {
  //   const tonAddress = await rpc.getAddress({
  //     network: 'ton',
  //     accountIndex: 0,
  //   })
  //   console.log(`ton Address:`, tonAddress)
  // } catch (error) {
  //   console.log(error)
  // }

  // try {
  //   const tonAbstractedAddressBalance = await rpc.getAddressBalance({
  //     network: 'ton',
  //     accountIndex: 0,
  //   })
  //   console.log(`ton Abstracted Address balance:`, tonAbstractedAddressBalance)
  // } catch (error) {
  //   console.log(error)
  // }

  // try {
  //   const tonBalance = await rpc.getAbstractedAddressTokenBalance({
  //     network: 'ton',
  //     accountIndex: 0,
  //     tokenAddress: USDT_BALANCE_ADDRESSES['ton']
  //   })
  //   console.log(`ton balance:`, tonBalance)
  // } catch (error) {
  //   console.log(error)
  // }
}

init()
