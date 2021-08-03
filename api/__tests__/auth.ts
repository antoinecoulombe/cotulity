const app = require('../app.js');
import 'jest';
import supertest from 'supertest';
const request = supertest(app);
const faker = require('faker');

export var authToken = '';

describe('authentication', () => {
  it('should receive 401, user not found', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'z.skyline@hotmail.com', password: '123123' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should register the user', async () => {
    let phone: string = await faker.phone.phoneNumber();
    const res = await request.post('/users/register').send({
      email: 'z.skyline@hotmail.com',
      password: '123123',
      firstname: await faker.name.firstName(),
      lastname: await faker.name.lastName(),
      phone: phone.substring(0, phone.indexOf('x')).trimEnd(),
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'register.success',
      msg: 'register.success',
    });
  });

  it('should authenticate user and receive an authentication token', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'z.skyline@hotmail.com', password: '123123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'login.success',
      msg: 'login.success',
      token: expect.anything(),
      userId: 1,
    });
    expect(res.body.token).toHaveLength(137);

    authToken = res.body.token;
  });
});
