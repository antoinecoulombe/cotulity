const app = require('../app.ts');
const faker = require('faker');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { TEST_USER, getTestUser } from '../routes/_utils/Test';

// Supertest
import supertest from 'supertest';
const request = supertest(app);

describe('authentication', () => {
  const CALLER = 'auth';
  var TOKEN = '';

  it('should register the user', async () => {
    const res = await request
      .post('/users/register')
      .send(await getTestUser(CALLER));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'register.success',
      msg: 'register.success',
    });
  });

  it('should authenticate user and receive an authentication token', async () => {
    const res = await request
      .post('/auth/login')
      .send(await getTestUser(CALLER, true));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'login.success',
      msg: 'login.success',
      token: expect.anything(),
      userId: expect.toBePositive(),
    });
    expect(res.body.token).toBeString();

    TOKEN = res.body.token;
  });

  it('should reject login due to user not found', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'coulombe.antoine@hotmail.com', password: '123123' });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should fail to register due to missing field', async () => {
    const res = await request.post('/users/register').send({
      email: 'coulombe.antoine@hotmail.com',
      password: '123123',
      lastname: 'doe',
      phone: '1234567890',
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.missingField',
      msg: 'request.missingField',
    });
  });

  it('should fail to register due to existing email', async () => {
    const res = await request
      .post('/users/register')
      .send(await getTestUser(CALLER));

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'register.error',
      msg: 'form.error.email.exists',
      input: 'email',
    });
  });

  it('should reject login due to missing field', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: TEST_USER.email(CALLER) });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should reject login due to wrong password', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: TEST_USER.email(CALLER), password: '123124' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should deny access due to invalid token', async () => {
    const res = await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN.substring(0, 132)}xxxxx`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.denied',
      msg: 'request.unauthorized',
    });
  });

  it('should delete the logged in user', async () => {
    const res = await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'user.deleted',
      msg: 'user.deleted',
    });
  });
});
