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
const Apps_1 = require("../Apps");
const Groceries = express_1.default.Router();
const db = require('../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
Groceries.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'groceries';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// ########################################################
// ######################### GET ##########################
// ########################################################
Groceries.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articles = yield res.locals.home.getGroceries({ paranoid: false });
        res.json({
            title: 'request.success',
            msg: 'request.success',
            articles: JSON.parse(JSON.stringify(articles, ['id', 'description', 'deletedAt'])),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
Groceries.put('/:id/:action', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actions = ['delete', 'restore'];
        const action = req.params.action;
        if (!action || !actions.includes(action))
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        const grocery = yield res.locals.home.getGroceries({
            where: { id: req.params.id },
            paranoid: false,
        });
        if (!grocery.length)
            return res
                .status(404)
                .json({ title: 'groceries.notFound', msg: 'groceries.notFound' });
        if (req.params.action == 'delete')
            yield grocery[0].destroy();
        else if (req.params.action == 'restore')
            yield grocery[0].restore();
        res.json({
            title: 'request.success',
            msg: 'request.success',
            article: JSON.parse(JSON.stringify(grocery[0], ['id', 'description', 'deletedAt'])),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            title: `groceries.${req.params.action}`,
            msg: 'request.error',
        });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
Groceries.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.description || !req.body.description.trim().length)
            return res
                .status(500)
                .json({ title: 'groceries.error.add', msg: 'groceries.descInvalid' });
        const article = yield db.Grocery.create({
            ownerId: req.user.id,
            homeId: res.locals.home.id,
            description: req.body.description,
        });
        res.json({
            title: 'groceries.added',
            msg: 'groceries.added',
            article: JSON.parse(JSON.stringify(article, ['id', 'description', 'deletedAt'])),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################## DELETE ########################
// ########################################################
Groceries.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const grocery = yield res.locals.home.getGroceries({
            where: { id: req.params.id },
            paranoid: false,
        });
        if (!grocery.length)
            return res
                .status(404)
                .json({ title: 'groceries.notFound', msg: 'groceries.notFound' });
        yield grocery[0].destroy({ force: true });
        res.json({ title: 'groceries.deleted', msg: 'groceries.deleted' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Groceries;
