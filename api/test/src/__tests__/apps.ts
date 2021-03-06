const db = require('../../../shared/db/models');

import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getIp, registerAndLogin } from '../../../shared/src/routes/Test';
import supertest from 'supertest';

describe('apps', () => {
  const reqGlobal = supertest(getIp('global'));
  const reqHomes = supertest(getIp('homes'));

  const CALLER = 'apps';
  var USER = { token: '', id: 0 };
  var apps: [{ id?: number; priority: number; name: string; image: string }];
  var homeRef: string;

  beforeAll(async () => {
    // Create test user
    USER = await registerAndLogin(CALLER, reqGlobal);

    // Create test app
    await db.App.create({
      priority: 99999,
      name: 'test',
      image: 'question-circle',
    });

    // create home and store its reference number
    homeRef = (
      await reqHomes
        .post(`/homes/appsTest`)
        .set('Authorization', `Bearer ${USER.token}`)
    ).body.refNumber;
  });

  it('should get all online apps', async () => {
    const res = await reqGlobal
      .get(`/apps`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.toBeNumber(),
          priority: expect.toBeNumber(),
          name: expect.toBeString(),
          image: expect.toBeString(),
        }),
      ])
    );

    apps = res.body;
  });

  it('should authorize an application access', async () => {
    const res = await reqGlobal
      .get(`/apps/${apps[0].name}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ title: 'request.authorized' });
  });

  it('should authorize an application access requiring a specific home', async () => {
    const res = await reqGlobal
      .get(`/apps/${apps[0].name}/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ title: 'request.authorized' });
  });

  it('should deny an application access due to invalid name', async () => {
    const res = await reqGlobal
      .get(`/apps/abcdefg`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should deny an application access due to it being offline', async () => {
    const res = await reqGlobal
      .get(`/apps/test`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'apps.offline',
    });
  });

  it('should deny an application access due to invalid home reference number', async () => {
    const res = await reqGlobal
      .get(`/apps/${apps[0].name}/123456`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should delete the logged in user', async () => {
    const res = await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'user.deleted',
      msg: 'user.deleted',
    });
  });
});
