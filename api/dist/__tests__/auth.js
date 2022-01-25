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
exports.authToken = void 0;
const app = require('../app.ts');
require("jest");
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default(app);
const faker = require('faker');
exports.authToken = '';
describe('authentication', () => {
    it('should receive 401, user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send({ email: 'z.skyline@hotmail.com', password: '123123' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({
            title: 'login.error',
            msg: 'login.error',
        });
    }));
    it('should register the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.post('/users/register').send({
            email: 'z.skyline@hotmail.com',
            password: '123123',
            firstname: yield faker.name.firstName(),
            lastname: yield faker.name.lastName(),
            phone: yield faker.phone.phoneNumber(),
        });
        console.log(yield res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'register.success',
            msg: 'register.success',
        });
    }));
    it('should authenticate user and receive an authentication token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post('/auth/login')
            .send({ email: 'z.skyline@hotmail.com', password: '123123' });
        console.log(yield res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'login.success',
            msg: 'login.success',
            token: expect.anything(),
            userId: 1,
        });
        expect(res.body.token).toHaveLength(137);
        exports.authToken = res.body.token;
    }));
});
