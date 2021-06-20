import express from 'express';
import Users from './routes/Users';
import mysql from 'mysql';
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'cotulity_user',
  password: 'cotulity_password',
  database: 'cotulity',
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});
const app = express();

const port = 3000;
app.use('/users', Users);
app.get('/', (req, res) => {
  connection.query('SHOW TABLES', (err: any, row: any) => {
    console.log(`ok:${JSON.stringify(row)}`);
  });
  res.send('The sedulous hyena ate the antelope!');
});
app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
