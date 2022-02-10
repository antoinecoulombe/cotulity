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
const app = require('../app.ts');
require("jest");
require("jest-extended");
require("jest-extended/all");
const supertest_1 = __importDefault(require("supertest"));
const auth_1 = require("./auth");
const request = supertest_1.default(app);
const db = require('../../db/models');
describe('apps', () => {
    var USER = { token: '', id: 0 };
    const CALLER = 'apps';
    var apps;
    var homeRef;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield auth_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield auth_1.getTestUser(CALLER, true))).body;
        USER.token = res.token;
        USER.id = res.userId;
        yield db.App.create({
            priority: 99999,
            name: 'test',
            image: 'question-circle',
        });
        homeRef = (yield request
            .post(`/homes/appsTest`)
            .set('Authorization', `Bearer ${USER.token}`)).body.refNumber;
    }));
    it('should get all online apps', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.toBeNumber(),
                priority: expect.toBeNumber(),
                name: expect.toBeString(),
                image: expect.toBeString(),
            }),
        ]));
        apps = res.body;
    }));
    it('should authorize an application access', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps/${apps[0].name}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ title: 'request.authorized' });
    }));
    it('should authorize an application access requiring a specific home', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps/${apps[0].name}/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ title: 'request.authorized' });
    }));
    it('should deny an application access due to invalid name', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps/abcdefg`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    it('should deny an application access due to it being offline', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps/test`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'apps.offline',
        });
    }));
    it('should deny an application access due to invalid home reference number', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/apps/${apps[0].name}/123456`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(500);
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
