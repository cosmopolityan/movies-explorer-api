const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const requiredString = require('./utils/requiredString');
const validate = require('./utils/validate');
const UnauthorizedError = require('../errors/unauthorizederror');

const userSchema = new mongoose.Schema(
  {
    email: {
      ...requiredString,
      unique: true,
      validate: validate.email,
    },
    password: {
      ...requiredString,
      select: false,
    },
    name: { // Поле name должно валидироваться по длине в соответствии с критериями. Тут вроде ок.
      ...requiredString,
      minlength: 2,
      maxlength: 30,
    },
  },
  { versionKey: false },
);

const rejectInvalidCredentials = () => Promise.reject(new Error('Неверный логин и/или пароль'));

// пришлось поменять название переменной на enterPass, чтобы было < 105 в строке
userSchema.statics.findUserByCredentials = function findUserByCredentials(email, enterPass, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return rejectInvalidCredentials(); // исправлено
      }

      return bcrypt.compare(enterPass, user.password)
        .then((matched) => {
          if (!matched) {
            return rejectInvalidCredentials(); // исправлено
          }

          return user;
        });
    })
    .catch(() => next(new UnauthorizedError()));
};
//

module.exports = mongoose.model('user', userSchema);
