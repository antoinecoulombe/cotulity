"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const db = require('./db/models');
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("./routes/Users"));
const body_parser_1 = __importDefault(require("body-parser"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const app = express_1.default();
// authentication
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'TO_CHANGE',
};
// lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield db.User.findOne({
        where: { id: jwt_payload.id },
    });
    next(null, user ? user : false);
}));
passport.use(strategy);
app.set('port', process.env.PORT || 3000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/users', Users_1.default);
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email && password) {
        let user = yield db.User.findOne({ where: { email: email } });
        if (!user) {
            res.status(401).json({ msg: 'User not found', user });
        }
        if (user.password === password) {
            let payload = { id: user.id };
            let token = jwt.sign(payload, jwtOptions.secretOrKey, {
                expiresIn: '1h',
            });
            res.json({ msg: 'ok', token: token });
        }
        else {
            res.status(401).json({ msg: 'The entered password is incorrect' });
        }
    }
}));
// protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        msg: 'Congrats! You are seeing this because you are authorized',
        id: jwt_decode_1.default(req.get('Authorization')),
    });
});
