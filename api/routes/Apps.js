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
const Apps = express_1.default.Router();
const db = require('../db/models');
const validateHome = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.homeId)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        const home = yield req.user.getHomes({
            where: { id: req.params.homeId },
        });
        if (home.length === 0)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        return next();
    }
    catch (error) {
        console.log(error);
        return next({ title: 'request.error', msg: 'request.error' });
    }
});
const validateApp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.appName)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        const app = yield db.App.findOne({ where: { name: req.params.appName } });
        if (!app)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        if (!app.online)
            return next({ title: 'request.denied', msg: 'apps.offline' });
        return next();
    }
    catch (error) {
        console.log(error);
        return next({ title: 'request.error', msg: 'request.error' });
    }
});
Apps.get('/:appName/', validateApp, (req, res) => {
    res.json({ title: 'request.authorized' });
});
Apps.get('/:appName/:homeId/', validateApp, validateHome, (req, res) => {
    res.json({ title: 'request.authorized' });
});
Apps.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apps = yield db.App.findAll({
            where: { online: true },
            attributes: ['id', 'name', 'image'],
        });
        res.json({ apps });
    }
    catch (e) {
        res.json({ title: 'apps.error', msg: 'request.reload' });
    }
}));
exports.default = Apps;
