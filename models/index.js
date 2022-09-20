const mongoose = require('mongoose');

const { MONGO } = require('../support/constants');

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
