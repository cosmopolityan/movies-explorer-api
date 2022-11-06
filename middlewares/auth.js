const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorizederror');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return new UnauthorizedError();
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-dev-secret');
  } catch (err) {
    return new UnauthorizedError();
  }

  req.user = payload;

  return next();
};
