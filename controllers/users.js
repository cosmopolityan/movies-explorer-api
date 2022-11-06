const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { names } = require('../errors/index');
const { messages } = require('../support/messages');
const ConflictError = require('../errors/conflicterror');
const NotFoundError = require('../errors/notfounderror');
const BadRequestError = require('../errors/badrequesterror');
const UnauthorizedError = require('../errors/unauthorizederror');

const { JWT } = require('../support/config');

const { NODE_ENV, JWT_SECRET } = process.env;

const tokenExpiration = { days: 7 };
tokenExpiration.sec = 60 * 60 * 24 * tokenExpiration.days;
tokenExpiration.ms = 1000 * tokenExpiration.sec;

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      next(new NotFoundError());
    })
    .then((data) => res.status(200).send(data)) // user -> data
    .catch((err) => {
      if (err.name === names.Cast) {
        next(new BadRequestError());
      }
      next();
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  if (!email || !password || !name) {
    const err = new BadRequestError();
    next(err);
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const err = new ConflictError();
        next(err);
      }
      bcrypt.hash(password, 10)
        .then((hash) => User.create({
          email,
          password: hash,
          name,
        }))
        .then(({ _id }) => res.status(201).send({
          message: messages.ok, //
          user: { _id, email, name },
        }))
        .catch((err) => {
          if (err.name === names.Validation) {
            next(new BadRequestError());
          }
          next(err); // next();
        });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        User.findById(userId)
          .then((me) => {
            if (me._id.toString() !== user._id.toString()) {
              const err = new ConflictError();
              next(err);
            }
          });
      }
      User.findByIdAndUpdate(
        req.user._id,
        { name, email },
        {
          new: true,
          runValidators: true,
          upsert: false,
        },
      )
        .orFail(() => {
          next(new NotFoundError());
        })
        .then((data) => res.send(data)) // .then((user) => res.send(user))
        .catch((err) => {
          if (err.name === names.Validation || err.name === names.Cast) {
            next(new BadRequestError());
          }
          next();
        });
    })
    .catch(() => {
      next();
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new BadRequestError();
    next(err);
  }

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError());
      }

      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new UnauthorizedError());
          } else {
            const token = jwt.sign(
              { _id: user._id },
              NODE_ENV === 'production' ? JWT_SECRET : JWT, // JWT
              { expiresIn: '7d' },
            );
            res
              .send({ token });
          }
        })
        .catch(() => {
          next();
        });
    })
    .catch(() => {
      next();
    });
};
