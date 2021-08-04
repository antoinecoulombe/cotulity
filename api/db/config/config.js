require('dotenv').config();
module.exports = {
  development: {
    username: 'cot_dev',
    password: 'dev_pwd',
    database: 'cotulity_dev',
    host: process.env.DB_HOST, // docker = 'db', local = '127.0.0.1'
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
  },
  test: {
    username: 'cot_test',
    password: 'test_pwd',
    database: 'cotulity_test',
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
  },
  production: {
    username: 'cot_prod',
    password: 'prod_pwd',
    database: 'cotulity',
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    dialectOptions: { autoJsonmap: false },
  },
};
