// Copyright 2025 Tether Operations Limited
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

export { default } from './src/wdk-core/wdk-manager.js'

// Export spec/hrpc
export { default as HRPC } from './spec/hrpc'

// Export spec/schema
export * as schema from './spec/schema'

//Export a react-native-bare-kit compatible bundle that generates on postinstall.
export { default as bundle } from './bundle/worklet.bundle.mjs'
