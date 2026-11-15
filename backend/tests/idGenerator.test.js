import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateReportId, isValidReportId } from '../src/utils/idGenerator.js';

describe('Report ID Generation', () => {
  test('should generate IDs with SIG- prefix followed by 6 characters/digits', () => {
    const id = generateReportId();
    assert.match(id, /^SIG-[0-9]{6}$/);
    assert.equal(isValidReportId(id), true);
  });

  test('should generate unique IDs across multiple invocations', () => {
    const set = new Set();
    for (let i = 0; i < 100; i++) {
      const id = generateReportId();
      assert.equal(isValidReportId(id), true);
      set.add(id);
    }
    assert.equal(set.size, 100);
  });

  test('should validate valid and invalid formats correctly', () => {
    assert.equal(isValidReportId('SIG-849201'), true);
    assert.equal(isValidReportId('sig-849201'), true);
    assert.equal(isValidReportId('SIG-ABC123'), true);
    assert.equal(isValidReportId('INVALID-123'), false);
    assert.equal(isValidReportId('SIG-12'), false);
    assert.equal(isValidReportId(''), false);
    assert.equal(isValidReportId(null), false);
  });
});
