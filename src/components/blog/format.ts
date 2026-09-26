// Dates in front matter are plain YYYY-MM-DD; format in UTC so server and
// client render the same string.
export function formatDate(date: string, style: 'long' | 'short' = 'short') {
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  });
}

export function dateParts(date: string) {
  const d = new Date(date);
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    monthYear: d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }).toUpperCase(),
    /** e.g. "JUL ’26" */
    monthShortYear: `${d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' }).toUpperCase()} ’${String(d.getUTCFullYear()).slice(2)}`,
  };
}
