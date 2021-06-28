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
const Router = express_1.default.Router();
const db = require('../db/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
Router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email && password) {
        let user = yield db.User.findOne({ where: { email: email } });
        if (!user)
            res.status(401).json({ error: 'User not found' });
        if (bcrypt.compareSync(password, user.password)) {
            let payload = { id: user.id };
            let token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '24h',
            });
            res.json({ success: 'User login authorized', token: token });
        }
        else
            res.status(401).json({ error: 'The entered password is incorrect' });
    }
}));
exports.default = Router;
