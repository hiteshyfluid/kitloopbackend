function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Recursively converts object/array keys from camelCase to snake_case.
// Leaves Date, and other non-plain-object values untouched.
function toSnakeCase(value) {
  if (Array.isArray(value)) {
    return value.map(toSnakeCase);
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    // Leave class instances (Decimal, Buffer, etc.) untouched — JSON.stringify
    // will call their toJSON() method and produce the correct primitive value.
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      return value;
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[camelToSnake(key)] = toSnakeCase(val);
    }
    return result;
  }

  return value;
}

module.exports = { toSnakeCase };
