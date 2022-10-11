require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const { MONGO } = require('./support/constants');
// const mainRouter = require('./routes/index');

const { PORT = 3000 } = process.env;

const app = express();
//
mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//
app.use(requestLogger);

app.use(
  rateLimiter,
  helmet(),
  cors({
    credentials: true,
    origin: [
      'https://movies.cosmopolityan.students.nomoredomains.sbs',
      'https://localhost:3000',
    ],
  }),
);

app.options('*', cors());

app.use(
  cookieParser(),
  express.json(),
);

app.use('/', require('./routes')); //
// app.use('/', mainRouter);

app.use(errorLogger);

app.use(
  errors(),
  errorHandler,
);

app.listen(PORT, () => console.log('API работает где-то точно 100 %'));
