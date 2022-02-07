const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import supertest from 'supertest';
import { getTestUser } from './auth';
const request = supertest(app);

describe('homes', () => {
  var USER = { token: '', id: 0 };
  const CALLER = 'homes';

  beforeAll(async () => {
    await request.post('/users/register').send(await getTestUser(CALLER));
    let res = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body;
    USER.token = res.token;
    USER.id = res.userId;
  });

  it('should create a home', async () => {
    const res = await request
      .post(`/homes/homesTest`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'newHome.created',
      msg: 'newHome.created',
      refNumber: expect.toBeString(),
    });
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
