require('dotenv').config();

import express from 'express';
import Users from './routes/Users';
import { Sequelize } from 'sequelize-typescript';
import { App } from './db/models/app';

const app = express();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'mariadb',
});

sequelize.addModels([App]);

app.set('port', process.env.PORT || 3000);
app.use('/users', Users);
app.get('/', (req, res) => {
  res.json('The sedulous hyena ate the antelope!');
  test();
});

async function test() {
  try {
    await sequelize.authenticate();
    const application = await App.findOne();
    console.log(application?.get());
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

app.listen(app.get('port'), () => {
  return console.log(`server is listening on ${app.get('port')}`);
});
