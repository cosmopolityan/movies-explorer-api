const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const requiredString = require('./utils/requiredString');
const validate = require('./utils/validate');

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
    name: {
      ...requiredString,
      minlength: 2,
      maxlength: 30,
    },
  },
  { versionKey: false },
);

const rejectInvalidCredentials = () => Promise.reject(new Error('Неверный логин и/или пароль'));

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, enteredPassword) {
  return this.findOne({ email }).select('+password')
    .then(({ password, ...user }) => {
      if (!user) {
        return rejectInvalidCredentials;
      }

      return bcrypt.compare(enteredPassword, password)
        .then((matched) => {
          if (!matched) {
            return rejectInvalidCredentials;
          }

          return user;
        });
    });
};
//

module.exports = mongoose.model('user', userSchema);
