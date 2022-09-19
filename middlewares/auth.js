const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorizederror');
const { JWT_SECRET } = require('../support/constants');

module.exports = (req, res, next) => {
  const authorization = req.cookies.jwt;

  if (!authorization) {
    throw new UnauthorizedError();
  }

  let payload;
  try {
    payload = jwt.verify(authorization, JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError();
  }

  req.user = payload;

  return next();
};
