/**
 * Utility function to format a Date object into SQLite-compatible datetime string.
 * @param {Date|string} date - The date object or datetime string.
 * @returns {string} - The formatted date string.
 */
function formatDateForSQLite(date) {
  if (date instanceof Date) {
    // If it's a Date object, format it as YYYY-MM-DD HH:mm:ss
    return date.toISOString().replace('T', ' ').split('.')[0];
  }
  if (typeof date === 'string') {
    // If it's already a string, return it as-is (assumed to be in the correct format)
    return date;
  }
  return null;
}

module.exports = formatDateForSQLite;
