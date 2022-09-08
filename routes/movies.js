const router = require('express').Router();

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
const { validateMovie, validateObjectId } = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', validateMovie, createMovie);

router.delete(':/movieId', validateObjectId, deleteMovie);

module.exports = router;
