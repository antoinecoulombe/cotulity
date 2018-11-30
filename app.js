var express = require('express'),
    routes = require('./routes'),
    app = express(),
    db = require('./models'),
    http = require('http'),
    passport = require('passport'),
    passportConfig = require('./config/passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session');

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', __dirname + '/views');
// app.set('port', process.env.PORT || 3003);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ 
    secret: 'TO_CHANGE',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', routes.index);

app.listen(3000);

// console.log('Starting server on port 3000');
