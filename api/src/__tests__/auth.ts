const app = require('../app.ts');
import 'jest';
import supertest from 'supertest';
const request = supertest(app);
const faker = require('faker');

var TOKEN = '';

describe('authentication', () => {
  it('should register the user', async () => {
    const res = await request.post('/users/register').send({
      email: 'z.skyline@hotmail.com',
      password: '123123',
      firstname: await faker.name.firstName(),
      lastname: await faker.name.lastName(),
      phone: await faker.phone.phoneNumber(),
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

    TOKEN = res.body.token;
  });

  it('should reject login due to user not found', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'coulombe.antoine@hotmail.com', password: '123123' });
    expect(res.statusCode).toEqual(404); // not found
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should fail to register due to missing field', async () => {
    const res = await request.post('/users/register').send({
      email: 'coulombe.antoine@hotmail.com',
      password: '123123',
      lastname: await faker.name.lastName(),
      phone: await faker.phone.phoneNumber(),
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'request.missingField',
      msg: 'request.missingField',
    });
  });

  it('should fail to register due to existing email', async () => {
    const res = await request.post('/users/register').send({
      email: 'z.skyline@hotmail.com',
      password: '59281722',
      firstname: await faker.name.firstName(),
      lastname: await faker.name.lastName(),
      phone: await faker.phone.phoneNumber(),
    });

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
      .send({ email: 'z.skyline@hotmail.com' });

    expect(res.statusCode).toEqual(500); // error
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should reject login due to wrong password', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'z.skyline@hotmail.com', password: '123124' });

    expect(res.statusCode).toEqual(401); // unauthorized
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should deny access', async () => {
    console.log(TOKEN);
    const res = await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'user.deleted',
      msg: 'user.deleted',
    });
  });

  it('should delete the logged in user', async () => {
    console.log(TOKEN);
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
