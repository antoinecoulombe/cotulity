import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import * as Global from '../../../shared/src/routes/Global';
import * as Translate from '../../../shared/src/routes/Translate';
import { registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest('http://127.0.0.1:3000');

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
    USER = await registerAndLogin(CALLER, reqGlobal);
  });

  it('should retreive an empty notifications array', async () => {
    const res = await reqGlobal
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

    const res = await reqGlobal
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
    const res = await reqGlobal
      .delete(`/notifications/delete/${notifications[0].id}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
    });
  });

  it('should fail to delete a notification due to invalid id', async () => {
    const res = await reqGlobal
      .delete(`/notifications/delete/999999`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  afterAll(async () => {
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
