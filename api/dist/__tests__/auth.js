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
exports.getTestUser = exports.USER = void 0;
const app = require('../app.ts');
require("jest");
require("jest-extended");
require("jest-extended/all");
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default(app);
const faker = require('faker');
exports.USER = {
    email: (suffix) => {
        return `test-${suffix}@hotmail.com`;
    },
    pwd: '123123',
};
function getTestUser(caller, basic) {
    return __awaiter(this, void 0, void 0, function* () {
        return basic
            ? { email: exports.USER.email(caller), password: exports.USER.pwd }
            : {
                email: exports.USER.email(caller),
                password: exports.USER.pwd,
                firstname: yield faker.name.firstName(),
                lastname: yield faker.name.lastName(),
                phone: yield faker.phone.phoneNumber(),
            };
    });
}
exports.getTestUser = getTestUser;
describe('authentication', () => {
    var TOKEN = '';
    const CALLER = 'auth';
    it('should register the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/users/register')
            .send(yield getTestUser(CALLER));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'register.success',
            msg: 'register.success',
        });
    }));
    it('should authenticate user and receive an authentication token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send(yield getTestUser(CALLER, true));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'login.success',
            msg: 'login.success',
            token: expect.anything(),
            userId: expect.toBePositive(),
        });
        expect(res.body.token).toBeString();
        TOKEN = res.body.token;
    }));
    it('should reject login due to user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send({ email: 'coulombe.antoine@hotmail.com', password: '123123' });
        expect(res.statusCode).toEqual(404); // not found
        expect(res.body).toEqual({
            title: 'login.error',
            msg: 'login.error',
        });
    }));
    it('should fail to register due to missing field', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.post('/users/register').send({
            email: 'coulombe.antoine@hotmail.com',
            password: '123123',
            lastname: yield faker.name.lastName(),
            phone: yield faker.phone.phoneNumber(),
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'request.missingField',
            msg: 'request.missingField',
        });
    }));
    it('should fail to register due to existing email', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.post('/users/register').send({
            email: exports.USER.email(CALLER),
            password: exports.USER.pwd,
            firstname: yield faker.name.firstName(),
            lastname: yield faker.name.lastName(),
            phone: yield faker.phone.phoneNumber(),
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'register.error',
            msg: 'form.error.email.exists',
            input: 'email',
        });
    }));
    it('should reject login due to missing field', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send({ email: exports.USER.email(CALLER) });
        expect(res.statusCode).toEqual(500); // error
        expect(res.body).toEqual({
            title: 'login.error',
            msg: 'login.error',
        });
    }));
    it('should reject login due to wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send({ email: exports.USER.email(CALLER), password: '123124' });
        expect(res.statusCode).toEqual(401); // unauthorized
        expect(res.body).toEqual({
            title: 'login.error',
            msg: 'login.error',
        });
    }));
    it('should deny access due to invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${TOKEN.substring(0, 132)}xxxxx`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should delete the logged in user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'user.deleted',
            msg: 'user.deleted',
        });
    }));
});
