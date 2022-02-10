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
const Image = __importStar(require("../routes/_utils/Image"));
const request = supertest_1.default(app);
var path = require('path');
describe('images', () => {
    var TOKEN = '';
    var URL = '';
    const CALLER = 'images';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Register a new user
        yield request.post('/users/register').send(yield auth_1.getTestUser(CALLER));
        // Get session token
        TOKEN = (yield request.post('/auth/login').send(yield auth_1.getTestUser(CALLER, true))).body.token;
        // Add profile picture to logged in user
        yield request
            .put('/users/current/picture')
            .attach('file', path.join(__dirname, 'assets', 'test_logo_red.png'))
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'multipart/form-data');
        // Get profile picture URL of logged in user
        URL = (yield request
            .get('/users/current/picture/url')
            .set('Authorization', `Bearer ${TOKEN}`)).body.url;
    }));
    it('should fail to retreive an image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/images/123456789`)
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'image.notFound',
            msg: 'picture.notFound',
        });
    }));
    it('should retreive an image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/images/${URL}`)
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(res.statusCode).toEqual(200);
    }));
    it('should retreive an image without auth', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.get(`/images/public/${URL}`);
        expect(res.statusCode).toEqual(200);
    }));
    it('should fail to delete an image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield Image.remove(99999);
        expect(res).toEqual({
            success: false,
            title: 'picture.couldNotDelete',
            msg: 'picture.notFound',
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${TOKEN}`);
    }));
});
