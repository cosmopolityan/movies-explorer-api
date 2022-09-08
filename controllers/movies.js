const { Movie } = require('../models/movie'); // не забыть прописать
const { classes } = require('../errors/classes'); // не забыть прописать
const { names } = require('../errors/names'); // не забыть прописать
const { StatusCodes } = require('../support/statusCodes'); // не забыть прописать

const {
  NotFoundError, BadRequestError, ForbiddenError,
} = classes;

const defaultPopulation = ['owner'];

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
    owner: req.user._id,
  })
    .then((data) => res.status(StatusCodes.created).send({ data }))
    .catch((err) => next(err.name === names.Validation ? new BadRequestError() : err));
};

module.exports.getMovies = (req, res, next) => Movie.find({})
  .populate(defaultPopulation)
  .then((data) => res.send({ data }))
  .catch(next);

module.exports.deleteMovie = async (req, res, next) => {
  let movie;
  try {
    movie = await Movie.findById(req.params.id)
      .orFail(new NotFoundError());
  } catch (error) {
    return next(error);
  }

  return movie.owner.toString() === req.user._id
    ? movie
      .delete()
      .then((data) => res.send({ data }))
      .catch((err) => next(err.name === names.Cast ? new BadRequestError() : err))
    : next(new ForbiddenError());
};
