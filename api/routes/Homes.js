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
Homes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbHomes = yield req.user.getHomes({
            through: { where: { accepted: true } },
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
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/create/:homeName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.homeName)
            return res.status(500).json({ title: '', msg: '' });
        const home = yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const refNumberDigits = 6;
            let refNumber;
            do {
                refNumber = Math.random()
                    .toString()
                    .slice(2, 2 + refNumberDigits);
            } while ((yield db.Home.findOne({ where: { refNumber: refNumber } })) != null);
            const home = yield db.Home.create({
                refNumber: refNumber,
                name: req.params.homeName,
                ownerId: req.user.id,
            }, { transaction: t });
            yield db.UserHome.create({
                userId: req.user.id,
                homeId: home.id,
                accepted: 1,
            }, { transaction: t });
            return home;
        }));
        res.json({
            title: 'newHome.created',
            msg: 'newHome.created',
            refNumber: home.refNumber,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/join/:refNumber', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.refNumber);
        const userHome = yield req.user.getHomes({
            where: { refNumber: req.params.refNumber },
            through: { paranoid: false },
        });
        if (userHome.length !== 0) {
            if (userHome[0].UserHome.deletedAt != null) {
                if (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) <
                    userHome[0].UserHome.deletedAt)
                    return res.status(500).json({
                        title: 'homes.requestAlreadyDenied',
                        msg: 'homes.waitWeek',
                    });
            }
            else {
                if (userHome[0].UserHome.accepted)
                    return res.status(500).json({
                        title: 'homes.couldNotJoin',
                        msg: 'homes.alreadyInHome',
                    });
                return res.status(500).json({
                    title: 'homes.couldNotJoin',
                    msg: 'homes.requestAlreadySent',
                });
            }
        }
        const home = yield db.Home.findOne({
            where: { refNumber: req.params.refNumber },
        });
        if (!home)
            return res
                .status(500)
                .json({ title: 'homes.notFound', msg: 'homes.notFound' });
        yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            db.Notification.create({
                typeId: 2,
                toId: home.ownerId,
                title: `{"translate":"homes.newRequest","format":["${home.name}"]}`,
                description: `{"translate":"homes.newRequest","format":["${req.user.firstname}","${home.name}"]}`,
            }, { transaction: t });
            if (((_b = (_a = userHome[0]) === null || _a === void 0 ? void 0 : _a.UserHome) === null || _b === void 0 ? void 0 : _b.deletedAt) != null)
                return userHome[0].UserHome.restore({}, { transaction: t });
            else
                return req.user.addHomes(home.id, { transaction: t });
        }));
        res.json({ title: 'homes.requestSent', msg: 'homes.requestSent' });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Homes;
