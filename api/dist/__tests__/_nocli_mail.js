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
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('../app.ts');
require("jest");
require("jest-extended");
require("jest-extended/all");
const Email_1 = require("../routes/_utils/Email");
describe('nocli-mail', () => {
    it('should fail to send an email', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield Email_1.sendEmail({
            from: 'cotulity.invitations@outlook.com',
            to: 'cotulity-test-2@hotmail.com',
            subject: `Testing emails - ignore`,
            html: 'test html',
        }, {
            host: 'smtp-mail.outlook.com',
            secureConnection: false,
            connectionTimeout: 1000,
            port: 587,
            tls: {
                ciphers: 'SSLv3',
            },
            auth: {
                user: 'cotulity.invitations@outlook.com',
                pass: '123456',
            },
        });
        expect(res).toEqual({
            success: false,
            title: 'homes.emailDidNotSend',
            msg: 'request.error',
        });
    }));
});
