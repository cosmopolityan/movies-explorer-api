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
    movieId: {
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

const Movie = mongoose.model('movie', movieSchema);

module.exports = Movie;
