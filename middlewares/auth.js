const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorizederror');
const { JWT_SECRET } = require('../support/constants');

module.exports = (req, res, next) => {
  // const authorization = req.cookies.jwt;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    // throw new UnauthorizedError();
    return new UnauthorizedError();
  }

  const token = authorization.replace('Bearer ', '');

  let payload;
  try {
    // payload = jwt.verify(authorization, JWT_SECRET);
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // throw new UnauthorizedError();
    return new UnauthorizedError();
  }

  req.user = payload;

  return next();
};
