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
  var URL = '';
  const CALLER = 'images';

  beforeAll(async () => {
    // Register a new user
    await request.post('/users/register').send(await getTestUser(CALLER));

    // Get session token
    TOKEN = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body.token;

    // Add profile picture to logged in user
    await request
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo_red.png'))
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'multipart/form-data');

    // Get profile picture URL of logged in user
    URL = (
      await request
        .get('/users/current/picture/url')
        .set('Authorization', `Bearer ${TOKEN}`)
    ).body.url;
  });

  it('should fail to retreive an image', async () => {
    const res = await request
      .get(`/images/123456789`)
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'image.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should retreive an image', async () => {
    const res = await request
      .get(`/images/${URL}`)
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should retreive an image without auth', async () => {
    const res = await request.get(`/images/public/${URL}`);

    expect(res.statusCode).toEqual(200);
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);
  });
});
