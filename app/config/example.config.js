require('dotenv').config(); 


module.exports = {

  // If using onine database
  // development: {
  //   use_env_variable: 'DATABASE_URL'
  // },

  development: {
    database: 'sangini',
    username: 'postgres',
    password: '1234',
    host: 'localhost',
    dialect: 'postgres'
  },

  test: {
    database: 'sangini_test',
    username: 'postgres',
    password: null,
    host: 'localhost',
    dialect: 'postgres'
  },

  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};
