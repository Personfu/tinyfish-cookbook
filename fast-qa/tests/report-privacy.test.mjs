import assert from 'node:assert/strict';
import test from 'node:test';
import { redactReportData, redactReportText } from '../lib/report-privacy.mjs';

test('redacts report text, nested keys, strings and numeric personal-data patterns', () => {
  const result = redactReportData({
    'sample@example.invalid': ['call 555-010-1234', { card: 4111111111111111 }],
    count: 3,
    active: true,
    absent: null,
  });
  assert.deepEqual(result, {
    '[EMAIL_REDACTED]': ['call [PHONE_REDACTED]', { card: '[CARD_REDACTED]' }],
    count: 3,
    active: true,
    absent: null,
  });
  assert.equal(redactReportText(undefined), '');
  assert.equal(redactReportText('Expected sample@example.invalid'), 'Expected [EMAIL_REDACTED]');
});

test('bounds nested extracted data without corrupting its JSON shape', () => {
  let value = { note: 'sample@example.invalid' };
  for (let index = 0; index < 20; index++) value = { nested: value };
  const serialized = JSON.stringify(redactReportData(value));
  assert.ok(serialized.includes('[NESTED_DATA_OMITTED]'));
  assert.ok(!serialized.includes('example.invalid'));
  assert.doesNotThrow(() => JSON.parse(serialized));
});
