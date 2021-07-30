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
exports.deleteNotificationsToUser = void 0;
const express_1 = __importDefault(require("express"));
const Notifications = express_1.default.Router();
const db = require('../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
function deleteNotificationsToUser(user, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.Notification.destroy({ where: { toId: user.id } }, { transaction: transaction });
            return { success: true, title: 'request.success', msg: 'request.success' };
        }
        catch (error) {
            console.log(error);
            return { success: false, title: 'request.error', msg: 'request.error' };
        }
    });
}
exports.deleteNotificationsToUser = deleteNotificationsToUser;
// ########################################################
// ######################### GET ##########################
// ########################################################
// Get all notifications linked to the connected user.
Notifications.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield db.Notification.findAll({
            order: [['createdAt', 'ASC']],
            where: { toId: req.user.id },
            attributes: ['id', 'title', ['description', 'msg']],
            include: {
                model: db.NotificationType,
                as: 'type',
                required: true,
                attributes: ['name', 'showTime'],
            },
        });
        yield notifications.forEach((n) => (n.dataValues.db = true));
        res.json(notifications);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
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
// Deletes the notification with the specified id.
Notifications.delete('/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield db.Notification.findOne({
            where: { toId: req.user.id, id: req.params.id },
        });
        if (!notification)
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        notification.destroy();
        return res.json({ title: 'request.success', msg: 'request.success' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Notifications;
