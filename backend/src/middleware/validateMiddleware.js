const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);
      return res.status(400).json({
        success: false,
        message: errorMessages.length > 0 ? errorMessages.join(", ") : "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    req.body = result.data;

    next();
  };
};

module.exports = validate;