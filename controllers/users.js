const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');
const { classes } = require('../errors/classes'); // не забыть прописать
const { names } = require('../errors/names'); // не забыть прописать
const { StatusCodes } = require('../support/statusCodes'); // не забыть прописать
const { messages } = require('../support/messages'); // не забыть прописать
const { JWT_SECRET } = require('../support/constants'); // не забыть прописать

const {
  NotFoundError, BadRequestError, ConflictError, UnauthorizedError,
} = classes;

const options = {
  runValidators: true,
  new: true,
};

const tokenExpiration = { days: 7 };
tokenExpiration.sec = 60 * 60 * 24 * tokenExpiration.days;
tokenExpiration.ms = 1000 * tokenExpiration.sec;

module.exports.getCurrentUser = (req, res, next) => User.findById(req.user._id)
  .then((data) => {
    if (!data) {
      throw new NotFoundError();
    }

    res.send({ data });
  })
  .catch((err) => next(err.name === names.cast ? new BadRequestError() : err));

module.exports.createUser = (req, res, next) => bcrypt.hash(req.body.password, 10)
  .then((hash) => User.create({
    email: req.body.email,
    password: hash,
    name: req.body.name,
  }))
  .then((dataWithPassword) => {
    const data = dataWithPassword;
    data.password = undefined;
    return res.status(StatusCodes.created).send({ data });
  })
  .catch((err) => {
    if (err.name === names.Mongo && err.code === StatusCodes.mongo) {
      throw new ConflictError();
    }
    if (err.name === names.Validation) {
      throw new BadRequestError();
    }
    next(err);
  })
  .catch(next);

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name }, options)
    .then((data) => {
      if (!data) {
        throw new NotFoundError();
      }
      return res.send({ data });
    })
    .catch((err) => {
      if (err.name === names.Validation || err.name === names.Cast) {
        throw new BadRequestError();
      }
      next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: tokenExpiration.sec });
      res
        .cookie('jwt', token, {
          maxAge: tokenExpiration.ms,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: messages.ok });
    })
    .catch(() => next(new UnauthorizedError()));
};

module.exports.logout = (req, res, next) => {
  res.clearCookie('jwt').send({ message: messages.ok });
  next();
};
