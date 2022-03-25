var path = require('path');

import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { registerAndLogin } from '../../../shared/src/routes/Test';
import * as Image from '../../../shared/src/routes/Image';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest('http://127.0.0.1:3000');

describe('noci-images', () => {
  const CALLER = 'images';
  var USER = { token: '', id: 0 };
  var URL = '';

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);
  });

  // #region User Picture

  it('should fail to retrieve the user image', async () => {
    const res = await reqGlobal
      .get('/users/current/picture')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should fail to retrieve the user image url', async () => {
    const res = await reqGlobal
      .get('/users/current/picture/url')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should upload a user image', async () => {
    const res = await reqGlobal
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
      .set('Authorization', `Bearer ${USER.token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  it('should upload a new user image', async () => {
    const res = await reqGlobal
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo_red.png'))
      .set('Authorization', `Bearer ${USER.token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  it('should retrieve the user image', async () => {
    const res = await reqGlobal
      .get('/users/current/picture')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should delete the user image', async () => {
    const res = await reqGlobal
      .delete('/users/current/picture')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.deleted',
      msg: 'user.imageDeleted',
    });
  });

  it('should fail to delete the user image', async () => {
    const res = await reqGlobal
      .delete('/users/current/picture')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'picture.couldNotDelete',
      msg: 'user.imageNotFound',
    });
  });

  it('should upload another user image', async () => {
    const res = await reqGlobal
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_logo.png'))
      .set('Authorization', `Bearer ${USER.token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'picture.updated',
      msg: 'user.imageUpdated',
    });
  });

  it('should fail image upload due to unsupported extension', async () => {
    const res = await reqGlobal
      .put('/users/current/picture')
      .attach('file', path.join(__dirname, 'assets', 'test_pdf.pdf'))
      .set('Authorization', `Bearer ${USER.token}`)
      .set('Content-Type', 'multipart/form-data');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'picture.couldNotUpload',
      msg: 'picture.unsupportedExtension',
      success: false,
    });
  });

  it('should retrieve the user image url', async () => {
    const res = await reqGlobal
      .get('/users/current/picture/url')
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      url: expect.toBeString(),
    });

    URL = res.body.url;
  });

  // #endregion

  it('should fail to retreive an image', async () => {
    const res = await reqGlobal
      .get(`/images/123456789`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'image.notFound',
      msg: 'picture.notFound',
    });
  });

  it('should retreive an image', async () => {
    const res = await reqGlobal
      .get(`/images/${URL}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should retreive an image without auth', async () => {
    const res = await reqGlobal.get(`/images/public/${URL}`);
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
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
