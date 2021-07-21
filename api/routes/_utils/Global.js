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
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondHtml = exports.readHtml = exports.format = exports.sendNotifications = void 0;
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const readFile = promisify(fs.readFile);
const db = require('../../db/models');
function sendNotifications(userIds, notification, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        function getNotification(toId, notification) {
            notification.toId = toId;
            return notification;
        }
        let notifications = [];
        userIds.forEach((id) => notifications.push(getNotification(id, notification)));
        yield db.Notification.bulkCreate(notifications, { transaction: transaction });
    });
}
exports.sendNotifications = sendNotifications;
function format(string, params) {
    var str = string;
    for (var i = 0; i < arguments[1].length; i++) {
        var regEx = new RegExp('\\{' + i + '\\}', 'gm');
        str = str.replace(regEx, params[i]);
    }
    return str;
}
exports.format = format;
function readHtml(p) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield readFile(path.join(__dirname, p), 'utf8');
    });
}
exports.readHtml = readHtml;
function respondHtml(res, html, code) {
    res.writeHead(code !== null && code !== void 0 ? code : 200, {
        'Content-Type': 'text/html',
        'Content-Length': html.length,
    });
    res.write(html);
    res.end();
}
exports.respondHtml = respondHtml;