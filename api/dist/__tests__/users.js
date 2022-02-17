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
describe('users', () => {
    const CALLER = 'users';
    var TOKEN = '';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request.post('/users/register').send(yield Test_1.getTestUser(CALLER));
        TOKEN = (yield request.post('/auth/login').send(yield Test_1.getTestUser(CALLER, true))).body.token;
    }));
    // TODO: delete when adding another test
    it('should do nothing', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(1).toEqual(1);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${TOKEN}`);
    }));
});
