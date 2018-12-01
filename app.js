var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    application = require('./routes/application'),
    app = express(),
    db = require('./models'),
    http = require('http'),
    passport = require('passport'),
    passportConfig = require('./config/passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    
    SALT_WORK_FACTOR = 12;

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 3000);

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
app.get('/login', user.login);
app.post('/authenticate', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
}));
app.get('/logout', application.destroySession);
app.get('/register', user.register);

app.listen(app.get('port'));

// console.log('Starting server on port 3000');
