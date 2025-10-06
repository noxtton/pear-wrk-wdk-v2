/* eslint-disable no-multiple-empty-lines */
import test from 'brittle'
import ERROR_CODES from '../../src/exceptions/error-codes.js'

test('ERROR_CODES enum contains expected keys', (t) => {
  t.is(ERROR_CODES.UNKNOWN, 'UNKNOWN')
  t.is(ERROR_CODES.ACCOUNT_BALANCES, 'ACCOUNT_BALANCES')
  t.is(ERROR_CODES.WDK_MANAGER_INIT, 'WDK_MANAGER_INIT')
  t.is(ERROR_CODES.BAD_REQUEST, 'BAD_REQUEST')
})
// end

