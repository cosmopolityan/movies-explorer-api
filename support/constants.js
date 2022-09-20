// const { NODE_ENV, JWT_SECRET, HOST = 'localhost' } = process.env;
const { NODE_ENV, JWT_SECRET, MONGO } = process.env;

const constants = {
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-dev-secret',
  MONGO: NODE_ENV === 'production' ? MONGO : 'mongodb://127.0.0.1:27017/moviesdb',
};

module.exports = constants;
