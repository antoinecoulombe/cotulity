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
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("./routes/Users"));
const sequelize_typescript_1 = require("sequelize-typescript");
const app_1 = require("./db/models/app");
const app = express_1.default();
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'mariadb',
});
sequelize.addModels([app_1.App]);
app.set('port', process.env.PORT || 3000);
app.use('/users', Users_1.default);
app.get('/', (req, res) => {
    res.json('The sedulous hyena ate the antelope!');
    test();
});
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            const application = yield app_1.App.findOne();
            console.log(application === null || application === void 0 ? void 0 : application.get());
            console.log('Connection has been established successfully.');
        }
        catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });
}
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});
