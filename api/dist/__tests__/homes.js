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
const db = require('../../db/models');
require("jest");
require("jest-extended");
require("jest-extended/all");
const Test_1 = require("../routes/_utils/Test");
// Supertest
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default(app);
const sendMailMock = jest.fn();
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
describe('homes', () => {
    const CALLER = 'homes';
    var USER = { token: '', id: 0 };
    var USER2 = { token: '', id: 0 };
    var homes = [];
    var inviteToken = '';
    const homeStruct = {
        id: expect.toBeNumber(),
        ownerId: expect.toBeNumber(),
        refNumber: expect.toBeString(),
        name: expect.toBeString(),
        memberCount: expect.toBeNumber(),
        UserHome: {
            nickname: expect.toBeOneOf([expect.toBeString(), undefined, null]),
            accepted: expect.toBeBoolean(),
        },
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create first user
        yield request.post('/users/register').send(yield Test_1.getTestUser(CALLER));
        let res = (yield request.post('/auth/login').send(yield Test_1.getTestUser(CALLER, true))).body;
        USER.token = res.token;
        USER.id = res.userId;
        // Create second user
        yield request.post('/users/register').send(yield Test_1.getTestUser('sender'));
        let res2 = (yield request.post('/auth/login').send(yield Test_1.getTestUser('sender', true))).body;
        USER2.token = res2.token;
        USER2.id = res2.userId;
    }));
    it('should create a home [USER]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/homes/home1`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'newHome.created',
            msg: 'newHome.created',
            refNumber: expect.toBeString(),
        });
        homes.push(res.body.refNumber);
    }));
    it('should get an empty array of homes [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            homes: expect.toBeArrayOfSize(0),
        });
    }));
    it('should create another home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/homes/home2`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'newHome.created',
            msg: 'newHome.created',
            refNumber: expect.toBeString(),
        });
        homes.push(res.body.refNumber);
    }));
    it('should ask to join a home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'homes.requestSent',
            msg: 'homes.requestSent',
        });
    }));
    it('should fail a join request due to already sent request [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.couldNotJoin',
            msg: 'homes.requestAlreadySent',
        });
    }));
    it('should get one accepted home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes/accepted`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.homes).toBeArrayOfSize(1);
        expect(res.body).toEqual({
            homes: [homeStruct],
        });
    }));
    it('should get two homes [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.homes).toBeArrayOfSize(2);
        expect(res.body).toEqual({
            homes: [homeStruct, homeStruct],
        });
    }));
    it('should deny join request [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/requests/${USER2.id}/reject`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
        });
    }));
    it('should fail a join request due to already refused request [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.requestAlreadyDenied',
            msg: 'homes.waitWeek',
        });
    }));
    it('should get one accepted home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes/accepted`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.homes).toBeArrayOfSize(1);
        expect(res.body).toEqual({
            homes: [homeStruct],
        });
    }));
    it('should get one home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.homes).toBeArrayOfSize(1);
        expect(res.body).toEqual({
            homes: [homeStruct],
        });
    }));
    it('should ask to join a home after a week wait [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        var d = new Date();
        d.setMonth(d.getMonth() - 1);
        // manually change request date to 1 month ago
        yield db.UserHome.update({ deletedAt: d.toJSON().slice(0, 19).replace('T', ' ') }, {
            where: { userId: USER2.id, accepted: false },
            paranoid: false,
        });
        const res = yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'homes.requestSent',
            msg: 'homes.requestSent',
        });
    }));
    it('should accept join request [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/requests/${USER2.id}/accept`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
        });
    }));
    it('should fail to accept join request due to user not in home [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/requests/999999/accept`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    it('should fail to handle request due to invalid request action [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        // url.../refuse is not a valid option
        const res = yield request
            .put(`/home/${homes[0]}/requests/${USER2.id}/refuse`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    it('should get two accepted homes [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/homes/accepted`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.homes).toBeArrayOfSize(2);
        expect(res.body).toEqual({
            homes: [homeStruct, homeStruct],
        });
    }));
    it('should fail a join request due to user in home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.couldNotJoin',
            msg: 'homes.alreadyInHome',
        });
    }));
    it('should fail a join request due to invalid home [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/homes/123456/join`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'homes.notFound',
            msg: 'homes.notFound',
        });
    }));
    it('should deny user removal due to him not being the owner [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/members/${USER2.id}/remove`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should deny user removal due to owner wanting to delete himself [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/members/${USER.id}/remove`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should deny user removal due to user not found [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/members/99999/remove`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'request.notFound',
            msg: 'request.notFound',
        });
    }));
    it('should fail to invite a user due to the invited user already being in home [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.couldNotSendInvite',
            msg: 'homes.emailAlreadyInHome',
        });
    }));
    it('should remove a user [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/members/${USER2.id}/remove`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
        });
    }));
    it('should invite a user and mock email [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        sendMailMock.mockReturnValue(Promise.resolve());
        sendMailMock.mockClear();
        nodemailer.createTransport.mockClear();
        const res = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'homes.invitationSent',
            msg: 'homes.invitationSent',
            success: true,
            token: expect.toBeString(),
        });
        expect(sendMailMock).toHaveBeenCalled();
        inviteToken = res.body.token;
    }));
    it('should fail to decline an invitation due to invalid token [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.get(`/homes/public/invitations/${inviteToken}123/decline`);
        expect(res.statusCode).toEqual(404);
    }));
    it('should decline an invitation [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.get(`/homes/public/invitations/${inviteToken}/decline`);
        expect(res.statusCode).toEqual(200);
    }));
    it('should fail to accept an invitation due to invalid token [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const inviteRes = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        inviteToken = inviteRes.body.token;
        const res = yield request
            .put(`/homes/invitations/${inviteToken}123/accept`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            title: 'homes.inviteNotFound',
            msg: 'homes.inviteNotFound',
        });
    }));
    it('should fail to accept an invitation due to user already in home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Find id of invited home
        let homeId = (yield db.Home.findOne({ where: { refNumber: homes[0] } })).id;
        // Add second user to the home
        yield db.UserHome.create({
            userId: USER2.id,
            homeId: homeId,
            accepted: true,
        });
        const res = yield request
            .put(`/homes/invitations/${inviteToken}/accept`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.couldNotJoin',
            msg: 'homes.alreadyInHome',
        });
    }));
    it('should quit a home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/quit`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: 'homes.homeLeft',
        });
    }));
    it('should fail to quit a home due to owner requesting [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/quit`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should accept an invitation on user already in home but not accepted [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Get another token while not in home
        const inviteRes = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        inviteToken = inviteRes.body.token;
        // Ask to join home
        yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        // Accept invitation to join home
        const res = yield request
            .put(`/homes/invitations/${inviteToken}/accept`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: 'newHome.created',
        });
    }));
    it('should accept an invitation on user soft deleted from home [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Find id of invited home
        let homeId = (yield db.Home.findOne({ where: { refNumber: homes[0] } })).id;
        // delete user from home
        yield db.UserHome.destroy({ where: { userId: USER2.id, homeId: homeId } });
        // Get another token while soft deleted from home
        const inviteRes = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        inviteToken = inviteRes.body.token;
        // Accept invitation to join home
        const res = yield request
            .put(`/homes/invitations/${inviteToken}/accept`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: 'newHome.created',
        });
    }));
    it('should accept an invitation [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Find id of invited home
        let homeId = (yield db.Home.findOne({ where: { refNumber: homes[0] } })).id;
        // Hard delete user from home
        yield db.UserHome.destroy({
            where: { userId: USER2.id, homeId: homeId },
            force: true,
        });
        // Get another token while hard deleted from home
        const inviteRes = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        inviteToken = inviteRes.body.token;
        // Accept invitation to join home
        const res = yield request
            .put(`/homes/invitations/${inviteToken}/accept`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: 'newHome.created',
        });
    }));
    it('should fail to accept an invitation due to passed expiration date [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Quit home
        yield request
            .delete(`/home/${homes[0]}/quit`)
            .set('Authorization', `Bearer ${USER2.token}`);
        // Get another token
        const inviteRes = yield request
            .post(`/home/${homes[0]}/invitations`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({
            email: (yield Test_1.getTestUser('sender')).email,
            fake: true,
        });
        inviteToken = inviteRes.body.token;
        var d = new Date();
        d.setMonth(d.getMonth() - 1);
        // Manually change creation date of token to 1 month ago
        yield db.HomeInvitation.update({ createdAt: d.toJSON().slice(0, 19).replace('T', ' ') }, { where: { token: inviteToken } });
        // Accept invitation to join home
        const res = yield request
            .put(`/homes/invitations/${inviteToken}/accept`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.inviteExpired',
            msg: 'homes.inviteExpired',
        });
    }));
    it('should cancel a request [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Ask to join home
        yield request
            .put(`/homes/${homes[0]}/join`)
            .set('Authorization', `Bearer ${USER2.token}`);
        // Cancel request to join home
        const res = yield request
            .delete(`/home/${homes[0]}/requests/cancel`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: 'homes.requestCancelled',
            msg: expect.toBeString(),
        });
    }));
    it('should fail to cancel a request due to it being already accepted [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        // Find id of invited home
        let homeId = (yield db.Home.findOne({ where: { refNumber: homes[0] } })).id;
        // Add second user to the home
        yield db.UserHome.create({
            userId: USER2.id,
            homeId: homeId,
            accepted: true,
        });
        // Cancel request to join home
        const res = yield request
            .delete(`/home/${homes[0]}/requests/cancel`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(501);
        expect(res.body).toEqual({
            title: 'homes.couldNotCancelRequest',
            msg: 'homes.alreadyInHome',
        });
    }));
    it('should fail to get home information due to requester not being owner [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/home/${homes[0]}`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should get home information [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/home/${homes[0]}`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.Members).toBeArrayOfSize(2);
        expect(res.body).toEqual({
            ownerId: expect.toBeNumber(),
            refNumber: expect.toBeString(),
            name: expect.toBeString(),
            Members: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeNumber(),
                    firstname: expect.toBeString(),
                    lastname: expect.toBeString(),
                    Image: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                    UserHome: {
                        nickname: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                        accepted: expect.toBeBoolean(),
                        deletedAt: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                    },
                }),
            ]),
            UserHome: {
                nickname: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                accepted: expect.toBeBoolean(),
                createdAt: expect.toBeString(),
                updatedAt: expect.toBeString(),
                deletedAt: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                homeId: expect.toBeNumber(),
                userId: expect.toBeNumber(),
            },
        });
    }));
    it('should get home users [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .get(`/home/${homes[0]}/users`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.users).toBeArrayOfSize(2);
        expect(res.body).toEqual({
            title: 'request.success',
            msg: 'request.success',
            users: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeNumber(),
                    firstname: expect.toBeString(),
                    lastname: expect.toBeString(),
                    Image: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                    Tasks: expect.toBeArrayOfSize(0),
                    UserHome: {
                        nickname: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                        accepted: expect.toBeBoolean(),
                        createdAt: expect.toBeString(),
                        updatedAt: expect.toBeString(),
                        deletedAt: expect.toBeOneOf([expect.toBeString(), null, undefined]),
                        homeId: expect.toBeNumber(),
                        userId: expect.toBeNumber(),
                    },
                }),
            ]),
        });
    }));
    it('should rename home as participant [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/rename`)
            .set('Authorization', `Bearer ${USER2.token}`)
            .send({ nickname: 'newtest-nickname' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: expect.toBeString(),
        });
    }));
    it('should fail to rename home as owner due to missing nickname [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/rename`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ nickname: '' });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            title: 'homes.couldNotRename',
            msg: 'homes.nameUndefined',
        });
    }));
    it('should rename home as owner [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .put(`/home/${homes[0]}/rename`)
            .set('Authorization', `Bearer ${USER.token}`)
            .send({ nickname: 'newtest-name' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: expect.toBeString(),
        });
    }));
    it('should fail to delete home due to request not being the owner [USER2]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/delete`)
            .set('Authorization', `Bearer ${USER2.token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            title: 'request.denied',
            msg: 'request.unauthorized',
        });
    }));
    it('should delete home [USER1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request
            .delete(`/home/${homes[0]}/delete`)
            .set('Authorization', `Bearer ${USER.token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            title: expect.toBeString(),
            msg: expect.toBeString(),
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${USER.token}`);
        yield request
            .delete('/users/delete')
            .set('Authorization', `Bearer ${USER2.token}`);
    }));
});
