# HRPC Command Documentation

## log

**Request:** `@wdk-core/log-request`

**Fields:**

- `type`: `enum (info, error, debug)` _(v1)_
- `data`: `string` _(v1)_

---

## workletStart

**Request:** `@wdk-core/workletStart-request`

**Fields:**

- `enableDebugLogs`: `uint` _(optional)_ _(v1)_
- `seedPhrase`: `string` _(optional)_ _(v1)_
- `seedBuffer`: `string` _(optional)_ _(v1)_
- `config`: `string` _(v1)_

**Response:** `@wdk-core/workletStart-response`

**Fields:**

- `status`: `string` _(v1)_

---

## getAddress

**Request:** `@wdk-core/getAddress-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_

**Response:** `@wdk-core/getAddress-response`

**Fields:**

- `address`: `string` _(v1)_

---

## getAddressBalance

**Request:** `@wdk-core/getAddressBalance-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_

**Response:** `@wdk-core/getAddressBalance-response`

**Fields:**

- `balance`: `string` _(v1)_

---

## quoteSendTransaction

**Request:** `@wdk-core/quoteSendTransaction-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `options`: `object` _(v1)_
  - `to`: `string` _(v1)_
  - `value`: `string` _(v1)_

**Response:** `@wdk-core/quoteSendTransaction-response`

**Fields:**

- `fee`: `string` _(v1)_

---

## sendTransaction

**Request:** `@wdk-core/sendTransaction-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `options`: `object` _(v1)_
  - `to`: `string` _(v1)_
  - `value`: `string` _(v1)_

**Response:** `@wdk-core/sendTransaction-response`

**Fields:**

- `fee`: `string` _(v1)_
- `hash`: `string` _(v1)_

---

## getAbstractedAddress

**Request:** `@wdk-core/getAbstractedAddress-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_

**Response:** `@wdk-core/getAbstractedAddress-response`

**Fields:**

- `address`: `string` _(v1)_

---

## getAbstractedAddressBalance

**Request:** `@wdk-core/getAbstractedAddressBalance-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_

**Response:** `@wdk-core/getAbstractedAddressBalance-response`

**Fields:**

- `balance`: `string` _(v1)_

---

## getAbstractedAddressTokenBalance

**Request:** `@wdk-core/getAbstractedAddressTokenBalance-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `tokenAddress`: `string` _(v1)_

**Response:** `@wdk-core/getAbstractedAddressTokenBalance-response`

**Fields:**

- `balance`: `string` _(v1)_

---

## abstractedAccountTransfer

**Request:** `@wdk-core/abstractedAccountTransfer-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `options`: `object` _(v1)_
  - `token`: `string` _(v1)_
  - `recipient`: `string` _(v1)_
  - `amount`: `string` _(v1)_
- `config`: `object` _(optional)_ _(v1)_
  - `paymasterToken`: `object` _(optional)_ _(v1)_
    - `address`: `string` _(v1)_
  - `transferMaxFee`: `string` _(optional)_ _(v2)_

**Response:** `@wdk-core/abstractedAccountTransfer-response`

**Fields:**

- `hash`: `string` _(v1)_
- `fee`: `string` _(v1)_

---

## getApproveTransaction

**Request:** `@wdk-core/getApproveTransaction-request`

**Fields:**

- `token`: `string` _(v1)_
- `recipient`: `string` _(v1)_
- `amount`: `string` _(v1)_

**Response:** `@wdk-core/getApproveTransaction-response`

**Fields:**

- `to`: `string` _(v1)_
- `value`: `string` _(v1)_
- `data`: `string` _(v1)_

---

## abstractedSendTransaction

**Request:** `@wdk-core/abstractedSendTransaction-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `options`: `string` _(v1)_
- `config`: `object` _(optional)_ _(v1)_
  - `paymasterToken`: `object` _(optional)_ _(v1)_
    - `address`: `string` _(v1)_

**Response:** `@wdk-core/abstractedSendTransaction-response`

**Fields:**

- `hash`: `string` _(v1)_
- `fee`: `string` _(v1)_

---

## abstractedAccountQuoteTransfer

**Request:** `@wdk-core/abstractedAccountQuoteTransfer-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `options`: `object` _(v1)_
  - `token`: `string` _(v1)_
  - `recipient`: `string` _(v1)_
  - `amount`: `string` _(v1)_
- `config`: `object` _(optional)_ _(v1)_
  - `paymasterToken`: `object` _(optional)_ _(v1)_
    - `address`: `string` _(v1)_

**Response:** `@wdk-core/abstractedAccountQuoteTransfer-response`

**Fields:**

- `fee`: `string` _(v1)_

---

## getTransactionReceipt

**Request:** `@wdk-core/getTransactionReceipt-request`

**Fields:**

- `network`: `string` _(v1)_
- `accountIndex`: `uint` _(v1)_
- `hash`: `string` _(v1)_

**Response:** `@wdk-core/getTransactionReceipt-response`

**Fields:**

- `receipt`: `string` _(v1)_

---

## dispose

**Request:** `@wdk-core/dispose-request`

**Fields:**

_No fields defined_

---

