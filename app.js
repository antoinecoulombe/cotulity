const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('views/index.html'));
});

app.post('/', (req, res) => {
    res.sendFile(path.resolve('views/apps.html'));
});

app.listen(3000);

console.log('Starting server on port 3000');
console.log(path.join(__dirname, '/client'));