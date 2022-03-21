const db = require('../../../shared/db/models');
require('dotenv').config({ path: __dirname + '/./../../../shared/.env' });

import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getTestUser, registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest('http://127.0.0.1:3000');
const reqHomes = supertest('http://127.0.0.1:3002');

describe('homes', () => {
  const CALLER = 'homes';
  var USER = { token: '', id: 0 };
  var USER2 = { token: '', id: 0 };
  var homes: number[] = [];
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

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);
    USER2 = await registerAndLogin('sender', reqGlobal);
  });

  it('should create a home [USER]', async () => {
    const res = await reqHomes
      .post(`/homes/home1`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'newHome.created',
      msg: 'newHome.created',
      refNumber: expect.toBeString(),
    });

    homes.push(res.body.refNumber);
  });

  it('should get an empty array of homes [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      homes: expect.toBeArrayOfSize(0),
    });
  });

  it('should create another home [USER2]', async () => {
    const res = await reqHomes
      .post(`/homes/home2`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'newHome.created',
      msg: 'newHome.created',
      refNumber: expect.toBeString(),
    });

    homes.push(res.body.refNumber);
  });

  it('should ask to join a home [USER2]', async () => {
    const res = await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'homes.requestSent',
      msg: 'homes.requestSent',
    });
  });

  it('should fail a join request due to already sent request [USER2]', async () => {
    const res = await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.couldNotJoin',
      msg: 'homes.requestAlreadySent',
    });
  });

  it('should get one accepted home [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes/accepted`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.homes).toBeArrayOfSize(1);
    expect(res.body).toEqual({
      homes: [homeStruct],
    });
  });

  it('should get two homes [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.homes).toBeArrayOfSize(2);
    expect(res.body).toEqual({
      homes: [homeStruct, homeStruct],
    });
  });

  it('should deny join request [USER1]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/requests/${USER2.id}/reject`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should fail a join request due to already refused request [USER2]', async () => {
    const res = await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.requestAlreadyDenied',
      msg: 'homes.waitWeek',
    });
  });

  it('should get one accepted home [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes/accepted`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.homes).toBeArrayOfSize(1);
    expect(res.body).toEqual({
      homes: [homeStruct],
    });
  });

  it('should get one home [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.homes).toBeArrayOfSize(1);
    expect(res.body).toEqual({
      homes: [homeStruct],
    });
  });

  it('should ask to join a home after a week wait [USER2]', async () => {
    var d = new Date();
    d.setMonth(d.getMonth() - 1);

    // manually change request date to 1 month ago
    await db.UserHome.update(
      { deletedAt: d.toJSON().slice(0, 19).replace('T', ' ') },
      {
        where: { userId: USER2.id, accepted: false },
        paranoid: false,
      }
    );

    const res = await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'homes.requestSent',
      msg: 'homes.requestSent',
    });
  });

  it('should accept join request [USER1]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/requests/${USER2.id}/accept`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should fail to accept join request due to user not in home [USER1]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/requests/999999/accept`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should fail to handle request due to invalid request action [USER1]', async () => {
    // url.../refuse is not a valid option
    const res = await reqHomes
      .put(`/home/${homes[0]}/requests/${USER2.id}/refuse`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should get two accepted homes [USER2]', async () => {
    const res = await reqHomes
      .get(`/homes/accepted`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.homes).toBeArrayOfSize(2);
    expect(res.body).toEqual({
      homes: [homeStruct, homeStruct],
    });
  });

  it('should fail a join request due to user in home [USER2]', async () => {
    const res = await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.couldNotJoin',
      msg: 'homes.alreadyInHome',
    });
  });

  it('should fail a join request due to invalid home [USER1]', async () => {
    const res = await reqHomes
      .put(`/homes/123456/join`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'homes.notFound',
      msg: 'homes.notFound',
    });
  });

  it('should deny user removal due to him not being the owner [USER2]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/members/${USER2.id}/remove`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should deny user removal due to owner wanting to delete himself [USER1]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/members/${USER.id}/remove`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should deny user removal due to user not found [USER1]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/members/99999/remove`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should fail to invite a user due to the invited user already being in home [USER1]', async () => {
    const res = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.couldNotSendInvite',
      msg: 'homes.emailAlreadyInHome',
    });
  });

  it('should remove a user [USER1]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/members/${USER2.id}/remove`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should invite a user and mock email [USER1]', async () => {
    const res = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'homes.invitationSent',
      msg: 'homes.invitationSent',
      success: true,
      token: expect.toBeString(),
    });

    inviteToken = res.body.token;
  });

  it('should fail to decline an invitation due to invalid token [USER2]', async () => {
    const res = await reqHomes.get(
      `/homes/public/invitations/${inviteToken}123/decline`
    );

    expect(res.statusCode).toEqual(404);
  });

  it('should decline an invitation [USER2]', async () => {
    const res = await reqHomes.get(
      `/homes/public/invitations/${inviteToken}/decline`
    );

    expect(res.statusCode).toEqual(200);
  });

  it('should fail to accept an invitation due to invalid token [USER2]', async () => {
    const inviteRes = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });
    inviteToken = inviteRes.body.token;

    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}123/accept`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'homes.inviteNotFound',
      msg: 'homes.inviteNotFound',
    });
  });

  it('should fail to accept an invitation due to user already in home [USER2]', async () => {
    // Find id of invited home
    let homeId = (await db.Home.findOne({ where: { refNumber: homes[0] } })).id;

    // Add second user to the home
    await db.UserHome.create({
      userId: USER2.id,
      homeId: homeId,
      accepted: true,
    });

    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.couldNotJoin',
      msg: 'homes.alreadyInHome',
    });
  });

  it('should quit a home [USER2]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/quit`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: 'homes.homeLeft',
    });
  });

  it('should fail to quit a home due to owner requesting [USER1]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/quit`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should accept an invitation on user already in home but not accepted [USER2]', async () => {
    // Get another token while not in home
    const inviteRes = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });
    inviteToken = inviteRes.body.token;

    // Ask to join home
    await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    // Accept invitation to join home
    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: 'newHome.created',
    });
  });

  it('should accept an invitation on user soft deleted from home [USER2]', async () => {
    // Find id of invited home
    let homeId = (await db.Home.findOne({ where: { refNumber: homes[0] } })).id;

    // delete user from home
    await db.UserHome.destroy({ where: { userId: USER2.id, homeId: homeId } });

    // Get another token while soft deleted from home
    const inviteRes = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });
    inviteToken = inviteRes.body.token;

    // Accept invitation to join home
    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: 'newHome.created',
    });
  });

  it('should accept an invitation [USER2]', async () => {
    // Find id of invited home
    let homeId = (await db.Home.findOne({ where: { refNumber: homes[0] } })).id;

    // Hard delete user from home
    await db.UserHome.destroy({
      where: { userId: USER2.id, homeId: homeId },
      force: true,
    });

    // Get another token while hard deleted from home
    const inviteRes = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });
    inviteToken = inviteRes.body.token;

    // Accept invitation to join home
    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: 'newHome.created',
    });
  });

  it('should fail to accept an invitation due to passed expiration date [USER2]', async () => {
    // Quit home
    await reqHomes
      .delete(`/home/${homes[0]}/quit`)
      .set('Authorization', `Bearer ${USER2.token}`);

    // Get another token
    const inviteRes = await reqHomes
      .post(`/home/${homes[0]}/invitations`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({
        email: (await getTestUser('sender')).email,
        fake: true,
      });
    inviteToken = inviteRes.body.token;

    var d = new Date();
    d.setMonth(d.getMonth() - 1);

    // Manually change creation date of token to 1 month ago
    await db.HomeInvitation.update(
      { createdAt: d.toJSON().slice(0, 19).replace('T', ' ') },
      { where: { token: inviteToken } }
    );

    // Accept invitation to join home
    const res = await reqHomes
      .put(`/homes/invitations/${inviteToken}/accept`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.inviteExpired',
      msg: 'homes.inviteExpired',
    });
  });

  it('should cancel a request [USER2]', async () => {
    // Ask to join home
    await reqHomes
      .put(`/homes/${homes[0]}/join`)
      .set('Authorization', `Bearer ${USER2.token}`);

    // Cancel request to join home
    const res = await reqHomes
      .delete(`/home/${homes[0]}/requests/cancel`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'homes.requestCancelled',
      msg: expect.toBeString(),
    });
  });

  it('should fail to cancel a request due to it being already accepted [USER2]', async () => {
    // Find id of invited home
    let homeId = (await db.Home.findOne({ where: { refNumber: homes[0] } })).id;

    // Add second user to the home
    await db.UserHome.create({
      userId: USER2.id,
      homeId: homeId,
      accepted: true,
    });

    // Cancel request to join home
    const res = await reqHomes
      .delete(`/home/${homes[0]}/requests/cancel`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(501);
    expect(res.body).toEqual({
      title: 'homes.couldNotCancelRequest',
      msg: 'homes.alreadyInHome',
    });
  });

  it('should fail to get home information due to requester not being owner [USER2]', async () => {
    const res = await reqHomes
      .get(`/home/${homes[0]}`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should get home information [USER1]', async () => {
    const res = await reqHomes
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
  });

  it('should get home users [USER1]', async () => {
    const res = await reqHomes
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
  });

  it('should rename home as participant [USER2]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/rename`)
      .set('Authorization', `Bearer ${USER2.token}`)
      .send({ nickname: 'newtest-nickname' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: expect.toBeString(),
    });
  });

  it('should fail to rename home as owner due to missing nickname [USER1]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/rename`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ nickname: '' });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'homes.couldNotRename',
      msg: 'homes.nameUndefined',
    });
  });

  it('should rename home as owner [USER1]', async () => {
    const res = await reqHomes
      .put(`/home/${homes[0]}/rename`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ nickname: 'newtest-name' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: expect.toBeString(),
    });
  });

  it('should fail to delete home due to request not being the owner [USER2]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/delete`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should delete home [USER1]', async () => {
    const res = await reqHomes
      .delete(`/home/${homes[0]}/delete`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: expect.toBeString(),
      msg: expect.toBeString(),
    });
  });

  afterAll(async () => {
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);

    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER2.token}`);
  });
});
