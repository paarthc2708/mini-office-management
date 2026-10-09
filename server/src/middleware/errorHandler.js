const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      code: "DUPLICATE_KEY",
    });
  }

  // Mongoose cast error (e.g. malformed ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}.`,
      code: "INVALID_ID",
    });
  }

  // Mongoose validation error (schema-level)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
    return res.status(400).json({
      success: false,
      message,
      code: "VALIDATION_ERROR",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
  });
}

module.exports = errorHandler;
