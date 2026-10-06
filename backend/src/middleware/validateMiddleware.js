/*
|--------------------------------------------------------------------------
| Zod request validation
|--------------------------------------------------------------------------
|
|   validate(schema)            -> validates req.body (default)
|   validate(schema, "query")   -> validates req.query, reject-only
|
| Query validation deliberately does NOT write the parsed value back:
| Express 5 exposes req.query through a prototype getter (a plain
| assignment silently fails) and every query consumer parses the raw
| strings itself, so rejecting invalid input is all that is needed.
|
| Path parameters are schema-validated separately via router.param()
| (see middleware/objectIdParam.js).
|
*/

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Deduped: several fields may share one message, e.g.
      // "Reason and description are required" on both reason and description.
      const errorMessages = [
        ...new Set(result.error.issues.map((issue) => issue.message))
      ];
      return res.status(400).json({
        success: false,
        message: errorMessages.length > 0 ? errorMessages.join(", ") : "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
};

module.exports = validate;
