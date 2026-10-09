class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message, code = "BAD_REQUEST") {
    return new ApiError(400, code, message);
  }

  static notFound(message, code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }

  static conflict(message, code = "CONFLICT") {
    return new ApiError(409, code, message);
  }
}

module.exports = ApiError;
