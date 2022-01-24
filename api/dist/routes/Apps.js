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
exports.validateApp = exports.validateHome = void 0;
const express_1 = __importDefault(require("express"));
const Apps = express_1.default.Router();
const db = require('../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// Verifies that the requested home is valid and accessible by the user.
exports.validateHome = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.refnumber)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        const home = yield req.user.getHomes({
            where: { refNumber: req.params.refnumber },
        });
        if (!home.length)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        res.locals.home = home[0];
        return next();
    }
    catch (error) {
        console.log(error);
        return next({ title: 'request.error', msg: 'request.error' });
    }
});
// Verifies that the requested application is valid and online.
exports.validateApp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.appname)
            return next({ title: 'request.notFound', msg: 'request.notFound' });
        const app = yield db.App.findOne({ where: { name: req.params.appname } });
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
// ########################################################
// ######################### GET ##########################
// ########################################################
// Validates application.
Apps.get('/:appname/', exports.validateApp, (req, res) => {
    res.json({ title: 'request.authorized' });
});
// Validates application and home.
Apps.get('/:appname/:refnumber/', exports.validateApp, exports.validateHome, (req, res) => {
    res.json({ title: 'request.authorized' });
});
// Get all online apps.
Apps.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apps = yield db.App.findAll({
            where: { online: true },
            attributes: ['id', 'priority', 'name', 'image'],
            order: db.sequelize.col('priority'),
        });
        res.json({ apps });
    }
    catch (e) {
        res.status(500).json({ title: 'apps.error', msg: 'request.reload' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// ########################################################
// ######################### POST #########################
// ########################################################
// ########################################################
// ######################## DELETE ########################
// ########################################################
exports.default = Apps;