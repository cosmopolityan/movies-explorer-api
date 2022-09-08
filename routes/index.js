const router = require('express').Router();

const { createUser, login, logout } = require('../controllers/users');

const auth = require('../middlewares/auth');

const { signInValidation, signUpValidation } = require('../middlewares/validation');

const { NotFoundError } = require('../errors/classes'); // не забыть прописать

const { messages } = require('../support/messages'); // не забыть прописать

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', signInValidation, login);
router.post('/signup', signUpValidation, createUser);
router.post('/signout', logout);

router.use('/users', auth, require('./users'));
router.use('/movies', auth, require('./movies'));

router.use('*', () => {
  throw new NotFoundError(messages.notFound);
});

module.exports = router;
