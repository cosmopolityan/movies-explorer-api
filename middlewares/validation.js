const { celebrate, CelebrateError, Joi } = require('celebrate');
const { isURL } = require('validator');

const { messages } = require('../support/messages');

const StringRequired = Joi.string().required();
const StringUri = Joi.string().custom((v) => {
  if (!isURL(v, { require_protocol: true })) {
    throw new CelebrateError(messages.badRequest);
  }
  return v;
});

const celebrateJoiBody = (obj) => celebrate({
  body: Joi.object().keys(obj),
});

const credentials = {
  email: StringRequired.email(),
  password: StringRequired,
};

const validateRegister = celebrate({
  body: Joi
    .object()
    .keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
});

const validateLogin = celebrateJoiBody({ ...credentials });

const validateUserInfo = celebrateJoiBody({
  email: StringRequired.email(),
  name: StringRequired,
});

const validateMovie = celebrateJoiBody({
  country: StringRequired,
  director: StringRequired,
  duration: Joi.number().required(),
  year: StringRequired,
  description: StringRequired,
  image: StringUri.required(),
  trailerLink: StringUri.required(),
  thumbnail: StringUri.required(),
  movieId: Joi.number().required(),
  nameRU: StringRequired,
  nameEN: StringRequired,
});

const validateMovieId = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24).required(),
  }),
});

module.exports = {
  validateRegister,
  validateLogin,
  validateUserInfo,
  validateMovie,
  validateMovieId,
};
