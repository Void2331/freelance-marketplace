const { z } = require("zod");

/*
|--------------------------------------------------------------------------
| Shared helpers for query-string schemas
|--------------------------------------------------------------------------
| Query strings have no null/undefined concept: `?page=` arrives as an
| empty string. The services treat empty values as "not provided"
| (`value || default`), so validation mirrors that before coercing.
|
*/

const emptyToUndefined = (value) =>
  value === "" || value === null ? undefined : value;

/*
| Optional integer: coerced from the query string, bounded, and
| skipped entirely when the parameter is omitted or empty.
*/
const optionalInt = ({ label, min, max }) => {
  let schema = z.coerce
    .number({ message: `${label} must be a number` })
    .int(`${label} must be an integer`)
    .min(min, `${label} must be at least ${min}`);

  if (max !== undefined) {
    schema = schema.max(max, `${label} cannot exceed ${max}`);
  }

  return z.preprocess(emptyToUndefined, schema.optional());
};

module.exports = {
  emptyToUndefined,
  optionalInt
};
