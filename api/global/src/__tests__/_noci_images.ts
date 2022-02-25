const app = require('../app.ts');
var path = require('path');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getTestUser } from '../../../shared/src/Test';
import * as Image from '../../../shared/src/Image';

// Supertest
import supertest from 'supertest';
const request = supertest(app);

describe('noci-images', () => {
  const CALLER = 'images';
  var TOKEN = '';
  var URL = '';

  beforeAll(async () => {
    // Register a new user
    await request.post('/users/register').send(await getTestUser(CALLER));

    // Get session token
    TOKEN = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body.token;
  });

  // #region User Picture

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

  it('should upload another user image', async () => {
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

  it('should fail image upload due to unsupported extension', async () => {
    const res = await request
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_pdf.pdf'))
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'picture.couldNotUpload',
      msg: 'picture.unsupportedExtension',
      success: false,
    });
  });

  it('should retrieve the user image url', async () => {
    const res = await request
      .get('/users/current/picture/url')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      url: expect.toBeString(),
    });

    URL = res.body.url;
  });

  // #endregion

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

  it('should fail to delete an image', async () => {
    const res = await Image.remove(99999);
    expect(res).toEqual({
      success: false,
      title: 'picture.couldNotDelete',
      msg: 'picture.notFound',
    });
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);
  });
});
