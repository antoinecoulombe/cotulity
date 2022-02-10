"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const app = require('../app.ts');
require("jest");
require("jest-extended");
require("jest-extended/all");
const supertest_1 = __importDefault(require("supertest"));
const auth_1 = require("./auth");
const Global = __importStar(require("../routes/_utils/Global"));
const Translate = __importStar(require("../routes/_utils/Translate"));
const request = supertest_1.default(app);
describe('notifications', () => {
    var USER = { token: '', id: 0 };
    const CALLER = 'notifications';
    var notifications;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield auth_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield auth_1.getTestUser(CALLER, true))).body;
        USER.token = res.token;
        USER.id = res.userId;
    }));
    it('should retreive an empty notifications array', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/notifications`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeArrayOfSize(0);
    }));
    it('should create 4 notifications and retreive them', () => __awaiter(void 0, void 0, void 0, function* () {
        let notifTypes = ['success', 'info', 'warning', 'error'];
        for (let i = 1; i <= 4; ++i)
            yield Global.sendNotifications([USER.id], {
                typeId: i,
                title: 'title.test.' + notifTypes[i - 1],
                description: Translate.getJSON('msg.test', [
                    notifTypes[i - 1].toString(),
                ]),
            });
        const res = yield request
            .get(`/notifications`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeArrayOfSize(4);
        notifications = res.body;
        for (let i = 0; i < 4; ++i) {
            let n = notifications[i];
            expect(n.title).toEqual('title.test.' + notifTypes[i]);
            expect(n.msg).toEqual(`{"translate":"msg.test","format":["${notifTypes[i]}"]}`);
            expect(n.type.name).toEqual(notifTypes[i]);
        }
    }));
    it('should delete the 4 notifications', () => __awaiter(void 0, void 0, void 0, function* () {
        notifications.forEach((n) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield request
                .delete(`/notifications/delete/${n.id}`)
                .set('Authorization', `Bearer ${USER.token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({
                title: 'request.success',
                msg: 'request.success',
            });
        }));
    }));
    it('should fail to delete a notification due to invalid id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/notifications/delete/999999`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${USER.token}`);
    }));
});
