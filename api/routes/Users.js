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
Users.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
            msg: (_b = (_a = e.errors[0]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'request.error',
            input: (_d = (_c = e.errors[0]) === null || _c === void 0 ? void 0 : _c.path) !== null && _d !== void 0 ? _d : null,
        });
    }
}));
exports.default = Users;
