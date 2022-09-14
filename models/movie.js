const mongoose = require('mongoose');

const requiredString = require('./utils/requiredString');
const validate = require('./utils/validate');

const movieSchema = new mongoose.Schema(
  {
    country: {
      ...requiredString,
    },
    director: {
      ...requiredString,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      ...requiredString,
    },
    description: {
      ...requiredString,
    },
    image: {
      ...requiredString,
      validate: validate.URL,
    },
    trailerLink: {
      ...requiredString,
      validate: validate.URL,
    },
    thumbnail: {
      ...requiredString,
      validate: validate.URL,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    movieId: { // не понимаю в чем проблема
      ...requiredString,
    },
    nameRU: {
      ...requiredString,
    },
    nameEN: {
      ...requiredString,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('movie', movieSchema);
