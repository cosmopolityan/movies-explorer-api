const validator = require('validator');

const validate = {
  URL: {
    validator: (link) => validator.isURL(link, { require_protocol: true }),
    message: 'Укажите ссылку',
  },
  email: {
    validator: validator.isEmail,
    message: 'Укажите  вашу электропочту',
  },
};

module.exports = validate;
