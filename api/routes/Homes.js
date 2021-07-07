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
const Homes = express_1.default.Router();
const db = require('../db/models');
Homes.use('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbHomes = yield req.user.getHomes({
            attributes: ['id', 'refNumber', 'name'],
        });
        res.json({
            homes: JSON.parse(JSON.stringify(dbHomes, [
                'id',
                'refNumber',
                'name',
                'UserHome',
                'nickname',
            ])),
        });
    }
    catch (e) {
        console.log(e);
        res.json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Homes;
