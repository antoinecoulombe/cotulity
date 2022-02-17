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
const Test_1 = require("../routes/_utils/Test");
// Supertest
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default(app);
describe('groceries', () => {
    const CALLER = 'groceries';
    var USER = { token: '', id: 0 };
    var homeRef;
    var groceries = [];
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield Test_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield Test_1.getTestUser(CALLER, true))).body;
        USER.token = res.token;
        USER.id = res.userId;
        homeRef = (yield request
            .post(`/homes/groceriesTest`)
            .set('Authorization', `Bearer ${USER.token}`)).body.refNumber;
    }));
    it('should get an empty grocery list', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            articles: expect.toBeArrayOfSize(0),
        });
    }));
    it('should fail to add an article to the grocery list due to invalid description', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ description: '' });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'groceries.error.add',
            msg: 'groceries.descInvalid',
        });
    }));
    it('should add three articles to the grocery list', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ description: 'pogos' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'groceries.added',
            msg: 'groceries.added',
            article: {
                id: expect.toBeNumber(),
                description: expect.toBeString(),
            },
        });
        groceries.push(res.body.article.id);
        const res2 = yield request
            .post(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ description: 'salsa' });
        groceries.push(res2.body.article.id);
        const res3 = yield request
            .post(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ description: 'tacos' });
        groceries.push(res3.body.article.id);
    }));
    it('should get 3 articles from the grocery list', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/groceries/${homeRef}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.articles).toBeArrayOfSize(3);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            articles: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeNumber(),
                    description: expect.toBeString(),
                }),
            ]),
        });
    }));
    it('should fail to delete an article due to invalid id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/groceries/${homeRef}/9999999`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'groceries.notFound',
            msg: 'groceries.notFound',
        });
    }));
    it('should delete an article', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/groceries/${homeRef}/${groceries[0]}`)
            .set('Authorization', `Bearer ${USER.token}`);
        groceries.splice(0, 1);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'groceries.deleted',
            msg: 'groceries.deleted',
        });
    }));
    it('should fail to soft delete an article due to invalid action', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/${groceries[0]}/notanaction`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    it('should fail to soft delete an article due to invalid id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/999999/delete`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'groceries.notFound',
            msg: 'groceries.notFound',
        });
    }));
    it('should soft delete an article', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/${groceries[0]}/delete`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            article: {
                id: expect.toBeNumber(),
                description: expect.toBeString(),
                deletedAt: expect.toBeString(),
            },
        });
    }));
    it('should soft delete the same article (no change should be made)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/${groceries[0]}/delete`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            article: {
                id: expect.toBeNumber(),
                description: expect.toBeString(),
                deletedAt: expect.toBeString(),
            },
        });
    }));
    it('should restore an article', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/${groceries[0]}/restore`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            article: {
                id: expect.toBeNumber(),
                description: expect.toBeString(),
                deletedAt: expect.toBeNil(),
            },
        });
    }));
    it('should restore the same article (no change should be made)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/groceries/${homeRef}/${groceries[0]}/restore`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            article: {
                id: expect.toBeNumber(),
                description: expect.toBeString(),
                deletedAt: expect.toBeNil(),
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${USER.token}`);
    }));
});
