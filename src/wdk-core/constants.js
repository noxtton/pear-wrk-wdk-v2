// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict'

/**
 * Network Types
 * @enum {string}
 */
export const NetworkType = {
  EVM: 'evm',
  EVM_ABSTRACTION: 'evm_abstraction',
  TON: 'ton',
  TON_ABSTRACTION: 'ton_abstraction',
  TRON: 'tron',
  TRON_ABSTRACTION: 'tron_abstraction',
  BITCOIN: 'bitcoin'
}

/**
 * Blockchain identifiers
 * @enum {string}
 */
export const Blockchain = {
  Ethereum: 'ethereum',
  Arbitrum: 'arbitrum',
  Polygon: 'polygon',
  Ton: 'ton',
  Tron: 'tron',
  Bitcoin: 'bitcoin'
}

/**
 * WDK Type identifiers
 * @enum {string}
 */
export const wdkType = {
  WDK: 'wdk',
  WDKReadOnly: 'wdkReadOnly'
}

/**
 * Mapping of blockchain to network type (standard wallets)
 */
export const BLOCKCHAIN_NETWORK_TYPE = {
  [Blockchain.Ethereum]: NetworkType.EVM,
  [Blockchain.Arbitrum]: NetworkType.EVM,
  [Blockchain.Polygon]: NetworkType.EVM,
  [Blockchain.Ton]: NetworkType.TON,
  [Blockchain.Tron]: NetworkType.TRON,
  [Blockchain.Bitcoin]: NetworkType.BITCOIN
}

/**
 * Mapping of blockchain to abstraction network type (abstracted wallets)
 * ethereum, arbitrum, polygon -> EVM_ABSTRACTION (WalletManagerEvmErc4337)
 * ton -> TON_ABSTRACTION (wdk-wallet-ton-gasless)
 * tron -> TRON_ABSTRACTION (wdk-wallet-tron-gasfree)
 */
export const BLOCKCHAIN_ABSTRACTION_NETWORK_TYPE = {
  [Blockchain.Ethereum]: NetworkType.EVM_ABSTRACTION,
  [Blockchain.Arbitrum]: NetworkType.EVM_ABSTRACTION,
  [Blockchain.Polygon]: NetworkType.EVM_ABSTRACTION,
  [Blockchain.Ton]: NetworkType.TON_ABSTRACTION,
  [Blockchain.Tron]: NetworkType.TRON_ABSTRACTION
}
