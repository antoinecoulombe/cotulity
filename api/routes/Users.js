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
const express_1 = __importDefault(require("express"));
const Users = express_1.default.Router();
const db = require('../db/models');
const bcrypt = require('bcryptjs');
Users.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db.User.findAll();
        res.json({ users });
    }
    catch (e) {
        res.json({ error: e });
    }
}));
Users.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let pwdHash = null;
    try {
        const { email, firstname, lastname, phone } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);
        const user = yield db.User.create({
            email,
            password,
            firstname,
            lastname,
            phone,
        });
        res.json({
            title: 'register.success',
            msg: 'register.success',
        });
    }
    catch (e) {
        res.status(500).json({
            title: e.errors[0] ? 'register.error' : 'request.error',
            msg: (_a = e.errors[0].message) !== null && _a !== void 0 ? _a : 'request.error',
        });
    }
}));
exports.default = Users;
