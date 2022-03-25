const db = require('../../../shared/db/models');

import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest('http://127.0.0.1:3000');
const reqAuth = supertest('http://127.0.0.1:2999');

describe('passport auth', () => {
  const CALLER = 'passport-auth';
  var USER = { token: '', id: 0 };
  var USER2 = { token: '', id: 0 };

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);
    USER2 = await registerAndLogin(CALLER + '2', reqGlobal, true);
  });

  it('should accept user login', async () => {
    const res = await reqAuth
      .get(`/auth`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should deny user login due to unverified email', async () => {
    const res = await reqAuth
      .get(`/auth`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({
      title: 'user.notVerified',
      msg: 'user.mustVerifyNoEmail',
    });
  });

  it('should deny user login due to user id not found in token', async () => {
    await db.VerificationEmail.destroy({
      where: { userId: USER2.id },
      force: true,
    });
    await db.User.destroy({ where: { id: USER2.id }, force: true });

    const res = await reqAuth
      .get(`/auth`)
      .set('Authorization', `Bearer ${USER2.token}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  afterAll(async () => {
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
