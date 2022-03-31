const db = require('../../../shared/db/models');

import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getIp, registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest(getIp('global'));
const reqAuth = supertest(getIp('auth'));

describe('passport auth', () => {
  const CALLER = 'passport-auth';
  var USER = { token: '', id: 0 };
  var USER2 = { token: '', id: 0 };

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);
    USER2 = await registerAndLogin(CALLER + '2', reqGlobal);
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
    await db.User.update(
      { emailVerifiedAt: null },
      { where: { id: USER2.id } }
    );

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
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER2.token}`);

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
