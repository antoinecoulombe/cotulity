"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// CORS
var cors = require('cors');
// Express
const app = express_1.default();
// Express Settings
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Middlewares
const AuthMiddleware_1 = __importDefault(require("./middlewares/AuthMiddleware"));
app.use(AuthMiddleware_1.default);
// Routes
const Auth_1 = __importDefault(require("./routes/Auth"));
app.use('/auth', Auth_1.default);
const Users_1 = __importDefault(require("./routes/Users"));
app.use('/users', Users_1.default);
const Notifications_1 = __importDefault(require("./routes/Notifications"));
app.use('/notifications', Notifications_1.default);
const Apps_1 = __importDefault(require("./routes/Apps"));
app.use('/apps', Apps_1.default);
// Generic Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        title: err.title || 'An error occured',
        msg: err.msg || 'Please try again.',
        err: err.complete,
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).send({
        title: '404 - Not found',
        msg: "Our robots can't find what you are looking for.",
    });
});
// Express Start
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});
