const { messages } = require('../support/messages');

class NotFoundError extends Error {
  constructor(message = messages.notFound) {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
