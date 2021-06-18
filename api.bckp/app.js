import express, { static } from 'express';
import { index } from './routes';
import { login, register } from './routes/user';
import { destroySession } from './routes/application';
var app = express();
import http from 'http';
import { initialize, session as _session, authenticate } from 'passport';
import passportConfig from './config/passport';
import { join } from 'path';
import { urlencoded, json } from 'body-parser';
import session from 'express-session';

app.use(static(join(__dirname, '/public')));

app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 3000);

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(session({ 
    secret: 'TO_CHANGE',
    resave: false,
    saveUninitialized: true
}));
app.use(initialize());
app.use(_session());



// #region Routes


app.get('/', index);
app.get('/login', login);
app.get('/logout', destroySession);

app.post('/authenticate', authenticate('local'), (req, res) => { res.redirect('/'); });
app.post('/register', register);


// #endregion


app.listen(app.get('port'));