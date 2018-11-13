const express = require('express');
const path = require('path');
const Users = require('../js/users');
let app = express();

app.use(express.static(path.join(__dirname, '../..', '/client')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('server/html/index.html'));
});

app.post('/', (req, res) => {
    res.sendFile(path.resolve('server/html/apps.html'), options);
});

app.post('/', (req, res) => {
    //login request
    Users.exists(new Users(1,1,1,1,1,1,1,1,1));
});

app.get('/tiles', (req, res) => {
    res.sendFile(path.resolve('server/html/tiles.html'));
});

app.listen(3000);

console.log('Starting server on port 3000');
console.log(path.join(__dirname, '../..', '/client'));