/** Redact common personal-data patterns before sending report context to a provider. */
export function redactReportText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_REDACTED]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

/** Keep extracted context structured; never replace digits in serialized JSON syntax. */
export function redactReportData(data) {
  function visit(value, depth) {
    if (depth > 12) return '[NESTED_DATA_OMITTED]';
    if (typeof value === 'string') return redactReportText(value);
    if (typeof value === 'number') {
      const text = String(value);
      const redacted = redactReportText(text);
      return redacted === text ? value : redacted;
    }
    if (Array.isArray(value)) return value.map((item) => visit(item, depth + 1));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [
        redactReportText(key), visit(item, depth + 1),
      ]));
    }
    return value;
  }
  return visit(data, 0);
}
