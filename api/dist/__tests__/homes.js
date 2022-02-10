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
describe('homes', () => {
    var USER = { token: '', id: 0 };
    const CALLER = 'homes';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield auth_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield auth_1.getTestUser(CALLER, true))).body;
        USER.token = res.token;
        USER.id = res.userId;
    }));
    it('should create a home', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/homes/homesTest`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'newHome.created',
            msg: 'newHome.created',
            refNumber: expect.toBeString(),
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${USER.token}`);
    }));
});
