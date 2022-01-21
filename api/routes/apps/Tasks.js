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
function getTasks(req, res, when, id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield res.locals.home.getTasks({
                where: when == 'all'
                    ? {
                        id: id == undefined ? { [Op.ne]: 0 } : id,
                        [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
                    }
                    : {
                        id: id == undefined ? { [Op.ne]: 0 } : id,
                        completedOn: when == 'completed' ? { [Op.ne]: null } : null,
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
                paranoid: false,
            });
        }
        catch (error) {
            throw error;
        }
    });
}
// ########################################################
// ######################### GET ##########################
// ########################################################
// Get all upcoming tasks
Tasks.get('/upcoming', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks = yield getTasks(req, res, 'upcoming');
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
        let tasks = yield getTasks(req, res, 'completed');
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
// ########################################################
// ######################### PUT ##########################
// ########################################################
// Modifies a task.
Tasks.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let task = yield getTasks(req, res, 'all', req.params.id);
        // 09/08@20:42
        let dateSplit = req.body.task.dueDateTime.split('@');
        let dayMonth = dateSplit[0].split('/');
        let hourMinute = dateSplit[1].split(':');
        let now = new Date();
        let month = parseInt(dayMonth[1]) - 1;
        let date = new Date(month < now.getMonth() ||
            (month == now.getMonth() && dayMonth[0] < now.getDay())
            ? now.getFullYear() + 1
            : now.getFullYear(), month, dayMonth[0], hourMinute[0], hourMinute[1]);
        // let task = await db.Task.create({
        //   homeId: res.locals.home.id,
        //   ownerId: req.user.id,
        //   name: req.body.task.name,
        //   dueDateTime: date.toUTCString(),
        //   shared: req.body.task.shared,
        //   important: req.body.task.important,
        // });
        // if (req.body.task.shared == false || !req.body.task.Users.length) {
        //   await db.UserTask.create({ userId: req.user.id, taskId: task.id });
        // } else {
        //   await req.body.task.Users.forEach(async (u: any) => {
        //     let members = (await res.locals.home.getMembers()).map(
        //       (m: any) => m.id
        //     );
        //     let toAdd: { userId: number; taskId: number }[] = [];
        //     if (members.includes(u.id))
        //       toAdd.push({ userId: u.id, taskId: task.id });
        //     if (toAdd.length) await db.UserTask.bulkCreate(toAdd);
        //   });
        // }
        res.json({
            title: 'tasks.modified',
            msg: 'tasks.modified',
            task: yield getTasks(req, res, 'upcoming', task.id),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// Completes a task.
Tasks.put('/:id/do', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks = yield getTasks(req, res, 'upcoming', req.params.id);
        if (!tasks.length)
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        tasks[0].completedOn = new Date();
        yield tasks[0].save();
        res.json({
            title: 'request.success',
            msg: 'request.success',
            completedOn: tasks[0].completedOn,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// Uncompletes a task.
Tasks.put('/:id/undo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks = yield getTasks(req, res, 'completed', req.params.id);
        if (!tasks.length)
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        tasks[0].completedOn = null;
        yield tasks[0].save();
        res.json({
            title: 'request.success',
            msg: 'request.success',
            completedOn: tasks[0].completedOn,
        });
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
        // 09/08@20:42
        let dateSplit = req.body.task.dueDateTime.split('@');
        let dayMonth = dateSplit[0].split('/');
        let hourMinute = dateSplit[1].split(':');
        let now = new Date();
        let month = parseInt(dayMonth[1]) - 1;
        let date = new Date(month < now.getMonth() ||
            (month == now.getMonth() && dayMonth[0] < now.getDay())
            ? now.getFullYear() + 1
            : now.getFullYear(), month, dayMonth[0], hourMinute[0], hourMinute[1]);
        let taskUsers = [];
        if (req.body.task.shared == false || !req.body.task.Users.length)
            taskUsers.push({ id: req.user.id });
        else {
            let members = (yield res.locals.home.getMembers()).map((m) => m.id);
            taskUsers = members.filter((u) => __awaiter(void 0, void 0, void 0, function* () { return req.body.task.Users.some((m) => __awaiter(void 0, void 0, void 0, function* () { return u.id === m.id; })); }));
        }
        if (!taskUsers.length)
            return res
                .status(500)
                .json({ title: 'request.error', msg: 'request.error' });
        let task = yield db.Task.create({
            homeId: res.locals.home.id,
            ownerId: req.user.id,
            name: req.body.task.name,
            dueDateTime: date.toUTCString(),
            shared: req.body.task.shared,
            important: req.body.task.important,
        });
        yield task.setUsers(taskUsers);
        res.json({
            title: 'tasks.created',
            msg: 'tasks.created',
            task: yield getTasks(req, res, 'upcoming', task.id),
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
// Deletes the task with the specified id.
Tasks.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks = yield getTasks(req, res, 'all', req.params.id);
        if (tasks.length == 0)
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        var deletedAt = null;
        if (tasks[0].deletedAt == null) {
            yield tasks[0].destroy();
            deletedAt = tasks[0].deletedAt;
        }
        else {
            yield tasks[0].destroy({ force: true });
        }
        res.json({
            title: 'request.success',
            msg: 'request.success',
            deletedAt: deletedAt,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Tasks;
