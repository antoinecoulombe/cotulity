"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Requires
const passport = require('passport');
require('./config/passport');
// Imports
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
// Express
const app = express_1.default();
// Express Settings
app.set('port', process.env.PORT || 3000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
const Users_1 = __importDefault(require("./routes/Users"));
app.use('/users', Users_1.default);
const Auth_1 = __importDefault(require("./routes/Auth"));
app.use('/auth', Auth_1.default);
// Express Start
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});
// protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        msg: 'Congrats! You are seeing this because you are authorized',
        id: jwt_decode_1.default(req.get('Authorization')),
    });
});
