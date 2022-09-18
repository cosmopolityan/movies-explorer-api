const router = require('express').Router();

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
// const { validateMovie, validateObjectId } = require('../middlewares/validation');
const { validateMovie, validateMovieId } = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', validateMovie, createMovie);

// router.delete('/:movieId', validateObjectId, deleteMovie);
router.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = router;
