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
var path = require('path');
describe('users', () => {
    var TOKEN = '';
    const CALLER = 'users';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield auth_1.getTestUser(CALLER));
        TOKEN = (yield request.post('/auth/login').send(yield auth_1.getTestUser(CALLER, true))).body.token;
    }));
    it('should fail to retrieve the user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get('/users/current/picture')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'picture.notFound',
            msg: 'picture.notFound',
        });
    }));
    it('should fail to retrieve the user image url', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get('/users/current/picture/url')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'picture.notFound',
            msg: 'picture.notFound',
        });
    }));
    it('should upload a user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put('/users/current/picture')
            .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'multipart/form-data');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'picture.updated',
            msg: 'user.imageUpdated',
        });
    }));
    it('should upload a new user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put('/users/current/picture')
            .attach('file', path.join(__dirname, 'assets', 'test_logo_red.png'))
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'multipart/form-data');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'picture.updated',
            msg: 'user.imageUpdated',
        });
    }));
    it('should retrieve the user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get('/users/current/picture')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(200);
    }));
    it('should retrieve the user image url', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get('/users/current/picture/url')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            url: expect.toBeString(),
        });
    }));
    it('should delete the user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete('/users/current/picture')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'picture.deleted',
            msg: 'user.imageDeleted',
        });
    }));
    it('should fail to delete the user image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete('/users/current/picture')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'picture.couldNotDelete',
            msg: 'user.imageNotFound',
        });
    }));
    it('should upload a user image for user deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put('/users/current/picture')
            .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'multipart/form-data');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'picture.updated',
            msg: 'user.imageUpdated',
        });
    }));
    it('should fail image upload due to unsupported extension', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put('/users/current/picture')
            .attach('file', path.join(__dirname, 'assets', 'test_pdf.pdf'))
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'multipart/form-data');
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'picture.couldNotUpload',
            msg: 'picture.unsupportedExtension',
            success: false,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${TOKEN}`);
    }));
});
