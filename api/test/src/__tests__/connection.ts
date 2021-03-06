import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import {
  TEST_USER,
  getTestUser,
  setEmailVerifiedAt,
  getIp,
} from '../../../shared/src/routes/Test';
import supertest from 'supertest';

describe('connection', () => {
  const reqGlobal = supertest(getIp('global'));

  const CALLER = 'auth';
  var TOKEN = '';
  var verificationToken = '';

  it('should register the user', async () => {
    const res = await reqGlobal
      .post('/users/register')
      .send(await getTestUser(CALLER));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'register.success',
      msg: 'register.success',
    });
  });

  it('should deny user login due to email not verified', async () => {
    const res = await reqGlobal
      .post('/auth/login')
      .send(await getTestUser(CALLER, true));

    expect(res.statusCode).toEqual(501);
    expect(res.body).toEqual({
      title: 'user.notVerified',
      msg: 'user.mustVerify',
    });
  });

  it('should fail to verify the user due to token not found', async () => {
    const res = await reqGlobal.put(`/users/public/verify/123456`).send();

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'account.verificationEmail.notFound',
      msg: 'account.verificationEmail.notFound',
    });
  });

  it('should verify the user', async () => {
    const result = await setEmailVerifiedAt(CALLER, reqGlobal);
    verificationToken = result.token || '';

    expect(result.res?.statusCode).toEqual(200);
    expect(result.res?.body).toEqual({
      title: 'account.verificationEmail.verified',
      msg: 'account.verificationEmail.verified',
    });
  });

  it('should fail to verify the user due to email already verified', async () => {
    const res = await reqGlobal
      .put(`/users/public/verify/${verificationToken}`)
      .send();

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'account.verificationEmail.alreadyVerified',
      msg: 'account.verificationEmail.alreadyVerified',
    });
  });

  it('should authenticate user and receive an authentication token', async () => {
    const res = await reqGlobal
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
    const res = await reqGlobal
      .post('/auth/login')
      .send({ email: 'coulombe.antoine@hotmail.com', password: '123123' });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should fail to register due to missing field', async () => {
    const res = await reqGlobal.post('/users/register').send({
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
    const res = await reqGlobal
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
    const res = await reqGlobal
      .post('/auth/login')
      .send({ email: TEST_USER.email(CALLER) });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should reject login due to wrong password', async () => {
    const res = await reqGlobal
      .post('/auth/login')
      .send({ email: TEST_USER.email(CALLER), password: '123124' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({
      title: 'login.error',
      msg: 'login.error',
    });
  });

  it('should delete the logged in user', async () => {
    const res = await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'user.deleted',
      msg: 'user.deleted',
    });
  });
});
