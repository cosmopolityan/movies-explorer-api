const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { names } = require('../errors/index');
// const { StatusCodes } = require('../support/statusCodes');
const { messages } = require('../support/messages');
// const { JWT_SECRET } = require('../support/constants');
const ConflictError = require('../errors/conflicterror');
const NotFoundError = require('../errors/notfounderror');
const BadRequestError = require('../errors/badrequesterror');
const UnauthorizedError = require('../errors/unauthorizederror');

const { JWT } = require('../support/config');

const { NODE_ENV, JWT_SECRET } = process.env;

// const options = {
//   runValidators: true,
//   new: true,
// };

const tokenExpiration = { days: 7 };
tokenExpiration.sec = 60 * 60 * 24 * tokenExpiration.days;
tokenExpiration.ms = 1000 * tokenExpiration.sec;

// module.exports.getCurrentUser = (req, res, next) => User.findById(req.user._id)
//   .then((data) => {
//     if (!data) {
//       throw new NotFoundError();
//     }

//     res.send({ data });
//   })
//   .catch((err) => next(err.name === names.Cast ? new BadRequestError() : err));

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

// module.exports.createUser = (req, res, next) => {
//   const { email } = req.body;

//   User.findOne({ email })
//     .then((user) => {
//       if (user) { // 409
//         const err = new ConflictError();
//         next(err);
//       }
//       bcrypt.hash(req.body.password, 10)
//         .then((hash) => User.create({
//           email: req.body.email,
//           password: hash,
//           name: req.body.name,
//         }))
//         .then((dataWithPassword) => {
//           const data = dataWithPassword;
//           data.password = undefined;
//           return res.status(StatusCodes.created).send({ data });
//         })
//         .catch((err) => {
//           if (err.name === names.Mongo && err.code === StatusCodes.mongo) {
//             throw new ConflictError();
//           }
//           if (err.name === names.Validation) {
//             throw new BadRequestError();
//           }
//           next(err);
//         })
//         .catch(next);
//     });
// };

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
          message: messages.ok,
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

// module.exports.updateUser = (req, res, next) => {
//   const { email, name } = req.body;

//   User.findByIdAndUpdate(req.user._id, { email, name }, options)
//     .then((data) => {
//       if (!data) {
//         throw new NotFoundError();
//       }
//       return res.send({ data });
//     })
//     .catch((err) => {
//       if (err.name === names.Validation || err.name === names.Cast) {
//         throw new BadRequestError();
//       }
//       next(err);
//     })
//     .catch((err) => {
//       if (err.name === names.Mongo && err.code === StatusCodes.mongo) {
//         throw new ConflictError();
//       }
//       if (err.name === names.Validation) {
//         throw new BadRequestError();
//       }
//       next(err);
//     });
// };

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

// module.exports.login = (req, res, next) => {
//   const { email, password } = req.body;

//   return User.findUserByCredentials(email, password)
//     .then((user) => {
//       console.log(user._id);
//       const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: tokenExpiration.sec });
//       res
//         .cookie('jwt', token, {
//           maxAge: tokenExpiration.ms,
//           httpOnly: true,
//           // sameSite: true,
//           // sameSite: 'None',
//           sameSite: 'none',
//           secure: true,
//         })
//         .send({ message: messages.ok });
//     })
//     .catch((err) => {
//       next(err);
//     });
// };

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

// module.exports.logout = (req, res) => {
//   res.clearCookie('jwt').send({ message: messages.ok });
// };
