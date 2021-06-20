"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("./routes/Users"));
const mysql_1 = __importDefault(require("mysql"));
const connection = mysql_1.default.createConnection({
    host: 'localhost',
    user: 'cotulity_user',
    password: 'cotulity_password',
    database: 'cotulity',
});
connection.connect((err) => {
    if (err)
        throw err;
    console.log('Connected!');
});
const app = express_1.default();
const port = 3000;
app.use('/users', Users_1.default);
app.get('/', (req, res) => {
    connection.query('SHOW TABLES', (err, row) => {
        console.log(`ok:${JSON.stringify(row)}`);
    });
    res.send('The sedulous hyena ate the antelope!');
});
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
