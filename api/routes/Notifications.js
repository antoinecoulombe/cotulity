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
const Notifications = express_1.default.Router();
const db = require('../db/models');
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
        res.json(notifications);
    }
    catch (error) {
        console.log(error);
        res.json(error);
    }
}));
exports.default = Notifications;
