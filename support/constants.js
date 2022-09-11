// const { NODE_ENV, JWT_SECRET, HOST = 'localhost' } = process.env;
const { NODE_ENV, JWT_SECRET, HOST = '127.0.0.1' } = process.env;

const constants = {
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-dev-secret',
  MONGO: `mongodb://${HOST}:27017/moviesdb`,
};

module.exports = constants;
