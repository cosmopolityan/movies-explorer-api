const router = require('express').Router();

const { createUser, login } = require('../controllers/users');

const auth = require('../middlewares/auth');

const { validateRegister, validateLogin } = require('../middlewares/validation');

const NotFoundError = require('../errors/notfounderror');

const { messages } = require('../support/messages');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', validateLogin, login);
router.post('/signup', validateRegister, createUser);

router.use(auth);

router.use('/signout', auth);
router.use('/users', auth, require('./users'));
router.use('/movies', auth, require('./movies'));

router.use('*', auth, () => {
  throw new NotFoundError(messages.notFound);
});

module.exports = router;
