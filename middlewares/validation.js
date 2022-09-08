const { celebrate, CelebrateError, Joi } = require('celebrate');
const { isValidObjectId } = require('mongoose');
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

const validateRegister = celebrateJoiBody({
  name: StringRequired,
  ...credentials,
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
  movieId: StringRequired,
  nameRU: StringRequired,
  nameEN: StringRequired,
});

const validateObjectId = celebrate({
  params: Joi.object().keys({
    id: StringRequired.custom((v) => {
      if (!isValidObjectId(v)) {
        throw new CelebrateError(messages.badRequest);
      }
      return v;
    }),
  }),
});

module.exports = {
  validateRegister,
  validateLogin,
  validateUserInfo,
  validateMovie,
  validateObjectId,
};
