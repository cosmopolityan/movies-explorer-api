const { messages } = require('../support/messages');

class BadRequestError extends Error {
  constructor(message = messages.badRequest) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
