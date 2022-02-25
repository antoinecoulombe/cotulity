const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import * as Global from '../../../shared/src/Global';
import * as Translate from '../../../shared/src/Translate';
import { getTestUser } from '../../../shared/src/Test';

// Supertest
import supertest from 'supertest';
const request = supertest(app);

describe('notifications', () => {
  const CALLER = 'notifications';
  var USER = { token: '', id: 0 };
  var notifications: [
    {
      id: number;
      title: string;
      msg: string;
      type: { name: string; showTime: number };
    }
  ];

  beforeAll(async () => {
    await request.post('/users/register').send(await getTestUser(CALLER));
    let res = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body;
    USER.token = res.token;
    USER.id = res.userId;
  });

  it('should retreive an empty notifications array', async () => {
    const res = await request
      .get(`/notifications`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeArrayOfSize(0);
  });

  it('should create a notification and retreive it', async () => {
    await Global.sendNotifications([USER.id], {
      typeId: 1,
      title: 'title.test.success',
      description: Translate.getJSON('msg.test', ['success']),
    });

    const res = await request
      .get(`/notifications`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeArrayOfSize(1);

    notifications = res.body;

    let n = notifications[0];
    expect(n.title).toEqual('title.test.success');
    expect(n.msg).toEqual(`{"translate":"msg.test","format":["success"]}`);
    expect(n.type.name).toEqual('success');
  });

  it('should delete the notification', async () => {
    const res = await request
      .delete(`/notifications/delete/${notifications[0].id}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should fail to delete a notification due to invalid id', async () => {
    const res = await request
      .delete(`/notifications/delete/999999`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
