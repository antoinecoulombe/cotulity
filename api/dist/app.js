"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// Requires
var cors = require('cors');
// Express
const app = express_1.default();
// Express Settings
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true, parameterLimit: 100, limit: '100mb' }));
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
const Images_1 = __importDefault(require("./routes/Images"));
app.use('/images', Images_1.default);
const Apps_1 = __importStar(require("./routes/Apps"));
app.use('/apps', Apps_1.default);
const Homes_1 = __importDefault(require("./routes/apps/Homes"));
app.use('/homes', Homes_1.default);
const Home_1 = __importDefault(require("./routes/apps/Home"));
app.use('/homes/:refnumber', Apps_1.validateHome, Home_1.default);
const Finances_1 = __importDefault(require("./routes/apps/Finances"));
app.use('/finances/:refnumber', Apps_1.validateHome, Finances_1.default);
const Groceries_1 = __importDefault(require("./routes/apps/Groceries"));
app.use('/groceries/:refnumber', Apps_1.validateHome, Groceries_1.default);
const Tasks_1 = __importDefault(require("./routes/apps/Tasks"));
app.use('/tasks/:refnumber', Apps_1.validateHome, Tasks_1.default);
const Settings_1 = __importDefault(require("./routes/apps/Settings"));
app.use('/settings', Settings_1.default);
// Generic Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        title: err.title || 'request.error',
        msg: err.msg || 'request.error',
        err: err.complete,
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).send({
        title: 'request.notFound',
        msg: 'request.notFound',
    });
});
module.exports = app;
