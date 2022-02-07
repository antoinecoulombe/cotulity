const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import supertest from 'supertest';
import { getTestUser } from './auth';
import * as Global from '../routes/_utils/Global';
import * as Translate from '../routes/_utils/Translate';
const request = supertest(app);

describe('notifications', () => {
  var USER = { token: '', id: 0 };
  const CALLER = 'notifications';
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

  it('should create 4 notifications and retreive them', async () => {
    let notifTypes = ['success', 'info', 'warning', 'error'];

    for (let i = 1; i <= 4; ++i)
      await Global.sendNotifications([USER.id], {
        typeId: i,
        title: 'title.test.' + notifTypes[i - 1],
        description: Translate.getJSON('msg.test', [
          notifTypes[i - 1].toString(),
        ]),
      });

    const res = await request
      .get(`/notifications`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeArrayOfSize(4);

    notifications = res.body;
    for (let i = 0; i < 4; ++i) {
      let n = notifications[i];
      expect(n.title).toEqual('title.test.' + notifTypes[i]);
      expect(n.msg).toEqual(
        `{"translate":"msg.test","format":["${notifTypes[i]}"]}`
      );
      expect(n.type.name).toEqual(notifTypes[i]);
    }
  });

  it('should delete the 4 notifications', async () => {
    notifications.forEach(async (n) => {
      const res = await request
        .delete(`/notifications/delete/${n.id}`)
        .set('Authorization', `Bearer ${USER.token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        title: 'request.success',
        msg: 'request.success',
      });
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
