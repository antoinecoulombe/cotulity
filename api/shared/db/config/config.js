require('dotenv').config({ path: __dirname + '/./../../.env' });

module.exports = {
  development: {
    username: process.env.DB_DEV_USER,
    password: process.env.DB_DEV_PWD,
    database: process.env.DB_DEV,
    host: process.env.DB_HOST, // docker = 'db', local = '127.0.0.1'
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
  },
  test: {
    username: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PWD,
    database: process.env.DB_TEST,
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
    logging: false,
  },
  production: {
    username: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PWD,
    database: process.env.DB_PROD,
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
  },
};
