const express = require('express');
const path = require('path');
const db = require('../js/models/database');
const UsersController = require('../js/controller/usersController');
const bodyParser = require('body-parser');

let app = express();
let usersController = new UsersController(db);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../..', '/client')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('server/html/index.html'));
});

// app.post('/', (req, res) => {
//     //login request
//     usersController.login(req.body.email, req.body.password, (err, result) => {
//         if (err)
//             res.send(err);
//         else
//             res.send(result);
//     });
// });

app.post('/', (req, res) => {
    //login request
    usersController.signup(req.body.email, req.body.password, "bob", "miller", "4507774444", (err, result) => {
        if (err)
            res.send(err);
        else
            res.send(result);
    });
});

app.get('/tiles', (req, res) => {
    res.sendFile(path.resolve('server/html/tiles.html'));
});

app.listen(3000);

console.log('Starting server on port 3000');
console.log(path.join(__dirname, '../..', '/client'));