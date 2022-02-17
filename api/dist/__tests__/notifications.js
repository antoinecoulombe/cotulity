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
const Global = __importStar(require("../routes/_utils/Global"));
const Translate = __importStar(require("../routes/_utils/Translate"));
const Test_1 = require("../routes/_utils/Test");
// Supertest
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default(app);
describe('notifications', () => {
    const CALLER = 'notifications';
    var USER = { token: '', id: 0 };
    var notifications;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield Test_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield Test_1.getTestUser(CALLER, true))).body;
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
    it('should create a notification and retreive it', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Global.sendNotifications([USER.id], {
            typeId: 1,
            title: 'title.test.success',
            description: Translate.getJSON('msg.test', ['success']),
        });
        const res = yield request
            .get(`/notifications`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeArrayOfSize(1);
        notifications = res.body;
        let n = notifications[0];
        expect(n.title).toEqual('title.test.success');
        expect(n.msg).toEqual(`{"translate":"msg.test","format":["success"]}`);
        expect(n.type.name).toEqual('success');
    }));
    it('should delete the notification', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/notifications/delete/${notifications[0].id}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
        });
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
