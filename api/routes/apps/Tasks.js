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
const Tasks = express_1.default.Router();
const db = require('../../db/models');
const { Op } = require('sequelize');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
Tasks.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'tasks';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// ########################################################
// ######################### GET ##########################
// ########################################################
// Get all upcoming tasks
Tasks.get('/upcoming', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield res.locals.home.getTasks({
            where: {
                completedOn: null,
                [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
            },
            attributes: [
                'id',
                'name',
                'dueDateTime',
                'important',
                'shared',
                'completedOn',
                'deletedAt',
            ],
            include: [
                {
                    model: db.User,
                    as: 'Users',
                    attributes: ['id', 'firstname', 'lastname'],
                    include: { model: db.Image, attributes: ['url'] },
                },
                {
                    model: db.User,
                    as: 'Owner',
                    attributes: ['id', 'firstname', 'lastname'],
                    include: { model: db.Image, attributes: ['url'] },
                },
            ],
        });
        res.json({
            title: 'request.success',
            msg: 'request.success',
            tasks: tasks,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// Get all completed tasks.
Tasks.get('/completed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// Creates a new task.
Tasks.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if not shared
        //    remove all userTasks with :id
        //    add ownerId to userTasks with :id
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
// Creates a new task.
Tasks.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if not shared
        //    add ownerId to userTasks with :id
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################## DELETE ########################
// ########################################################
// Delets the task with the specified id.
Tasks.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Tasks;
