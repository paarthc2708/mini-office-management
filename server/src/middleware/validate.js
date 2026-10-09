const ApiError = require("../utils/ApiError");

/**
 * schemas: { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 * Parsed (coerced/defaulted) values are written back onto req so handlers
 * see clean data.
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    next();
  } catch (err) {
    if (err.issues) {
      const message = err.issues
        .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
        .join("; ");
      return next(ApiError.badRequest(message, "VALIDATION_ERROR"));
    }
    next(err);
  }
};

module.exports = validate;
