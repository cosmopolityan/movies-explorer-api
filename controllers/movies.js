const Movie = require('../models/movie');
const { classes, names } = require('../errors/index');
const { StatusCodes } = require('../support/statusCodes');
// const messages = require('../support/messages');
const { ForbiddenError } = require('../errors/classes');

const {
  NotFoundError, BadRequestError, /* ForbiddenError, */
} = classes;

// const defaultPopulation = ['owner'];

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id, //
  })
    .then((data) => res.status(StatusCodes.created).send({ data }))
    .catch((err) => next(err.name === names.Validation ? new BadRequestError() : err));
};

module.exports.getMovies = (req, res, next) => {
  // Movie.find({})
  // .populate(defaultPopulation)
  Movie.find({ owner: req.user._id })
    .then((data) => res.send({ data }))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError();
    })
    .then(async (movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError();
      }
      await movie.remove();
      return res.send({ message: 'Фильм удалён из Избранного' });
    })
    .catch((err) => {
      next(err);
    });
};
