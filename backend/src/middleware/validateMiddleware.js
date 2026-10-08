

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Deduplicate messages because several fields can share
      // the same validation message.
      const errorMessages = [
        ...new Set(
          result.error.issues.map((issue) => issue.message)
        ),
      ];

      return res.status(400).json({
        success: false,
        message:
          errorMessages.length > 0
            ? errorMessages.join(", ")
            : "Validation failed",
      });
    }

    /*
    Only replace body because Express allows it safely and the
    parsed value may contain useful Zod transformations/defaults.

    For query parameters, keep the original req.query object.
    */
    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
};

module.exports = validate;