const { messages } = require('../support/messages');

class BadRequestError extends Error {
  constructor(message = messages.badRequest) {
    super(message);
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message = messages.unauthorized) {
    super(message);
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = messages.forbidden) {
    super(message);
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = messages.notFound) {
    super(message);
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message = messages.conflict) {
    super(message);
    this.statusCode = 409;
  }
}

class InternalServerError extends Error {
  constructor(message = messages.internal) {
    super(message);
    this.statusCode = 500;
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
