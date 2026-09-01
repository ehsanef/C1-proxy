import test from 'node:test';
import assert from 'node:assert/strict';
import { isBlockedDestination, parseCleanTargets } from '../src/utils/network';

test('blocks private/loopback destinations', () => {
  assert.equal(isBlockedDestination('127.0.0.1', 443), true);
  assert.equal(isBlockedDestination('10.0.0.2', 443), true);
  assert.equal(isBlockedDestination('192.168.1.2', 443), true);
  assert.equal(isBlockedDestination('example.com', 443), false);
});

test('deduplicates clean targets', () => {
  assert.deepEqual(parseCleanTargets('1.1.1.1\n1.1.1.1\nexample.com'), ['1.1.1.1','example.com']);
});
