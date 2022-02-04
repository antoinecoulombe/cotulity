const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import supertest from 'supertest';
import { getTestUser } from './auth';
const request = supertest(app);
var path = require('path');

describe('users', () => {
  var TOKEN = '';
  const CALLER = 'user';

  beforeAll(async () => {
    await request.post('/users/register').send(await getTestUser(CALLER));
    TOKEN = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body.token;
  });

  it('should fail to retrieve the user image', async () => {
    const res = await request
      .get('/users/current/picture')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should fail to retrieve the user image url', async () => {
    const res = await request
      .get('/users/current/picture/url')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should upload a user image', async () => {
    const res = await request
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  it('should upload a new user image', async () => {
    const res = await request
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo_red.png'))
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  it('should retrieve the user image', async () => {
    const res = await request
      .get('/users/current/picture')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should retrieve the user image url', async () => {
    const res = await request
      .get('/users/current/picture/url')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      url: expect.toBeString(),
    });
  });

  it('should delete the user image', async () => {
    const res = await request
      .delete('/users/current/picture')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.deleted',
      msg: 'user.imageDeleted',
    });
  });

  it('should fail to delete the user image', async () => {
    const res = await request
      .delete('/users/current/picture')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.couldNotDelete',
      msg: 'user.imageNotFound',
    });
  });

  it('should upload a user image for user deletion', async () => {
    const res = await request
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);
  });
});
