const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyPattern || {})[0];

    message = `${field || "Field"} already exists`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.name === "MulterError") {
    statusCode = 400;

    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large (5MB max)"
        : err.message;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;