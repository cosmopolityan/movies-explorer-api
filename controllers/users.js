const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { names } = require('../errors/index');
const { StatusCodes } = require('../support/statusCodes');
const { messages } = require('../support/messages');
const { JWT_SECRET } = require('../support/constants');
const ConflictError = require('../errors/conflicterror');
const NotFoundError = require('../errors/notfounderror');
const BadRequestError = require('../errors/badrequesterror');

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
  .catch((err) => next(err.name === names.Cast ? new BadRequestError() : err));

module.exports.createUser = (req, res, next) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) { // 409
        const err = new ConflictError();
        next(err);
      }
      bcrypt.hash(req.body.password, 10)
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
    });
};

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
    .catch((err) => {
      if (err.name === names.Mongo && err.code === StatusCodes.mongo) {
        throw new ConflictError();
      }
      if (err.name === names.Validation) {
        throw new BadRequestError();
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      console.log(user._id);
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: tokenExpiration.sec });
      res
        .cookie('jwt', token, {
          maxAge: tokenExpiration.ms,
          httpOnly: true,
          // sameSite: true,
          // sameSite: 'None',
          sameSite: 'none',
          secure: true,
        })
        .send({ message: messages.ok });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt').send({ message: messages.ok });
};
