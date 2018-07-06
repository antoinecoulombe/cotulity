const express = require('express');
const path = require('path');
let app = express();

app.use(express.static(path.join(__dirname, '../..', '/client')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('server/html/homePage.html'));
});

app.listen(3000);

console.log('Starting server on port 3000');
console.log(path.join(__dirname, '../..', '/client'));