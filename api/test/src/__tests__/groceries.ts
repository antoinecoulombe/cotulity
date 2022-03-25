import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getIp, registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest(getIp('global'));
const reqGroceries = supertest(getIp('groceries'));
const reqHomes = supertest(getIp('homes'));

describe('groceries', () => {
  const CALLER = 'groceries';
  var USER = { token: '', id: 0 };
  var homeRef: string;
  var groceries: number[] = [];

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);

    homeRef = (
      await reqHomes
        .post(`/homes/groceriesTest`)
        .set('Authorization', `Bearer ${USER.token}`)
    ).body.refNumber;
  });

  it('should get an empty grocery list', async () => {
    const res = await reqGroceries
      .get(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      articles: expect.toBeArrayOfSize(0),
    });
  });

  it('should fail to add an article to the grocery list due to invalid description', async () => {
    const res = await reqGroceries
      .post(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ description: '' });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      title: 'groceries.error.add',
      msg: 'groceries.descInvalid',
    });
  });

  it('should add three articles to the grocery list', async () => {
    const res = await reqGroceries
      .post(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ description: 'pogos' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'groceries.added',
      msg: 'groceries.added',
      article: {
        id: expect.toBeNumber(),
        description: expect.toBeString(),
      },
    });
    groceries.push(res.body.article.id);

    const res2 = await reqGroceries
      .post(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ description: 'salsa' });
    groceries.push(res2.body.article.id);

    const res3 = await reqGroceries
      .post(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`)
      .send({ description: 'tacos' });
    groceries.push(res3.body.article.id);
  });

  it('should get 3 articles from the grocery list', async () => {
    const res = await reqGroceries
      .get(`/groceries/${homeRef}`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.articles).toBeArrayOfSize(3);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      articles: expect.arrayContaining([
        expect.objectContaining({
          id: expect.toBeNumber(),
          description: expect.toBeString(),
        }),
      ]),
    });
  });

  it('should fail to delete an article due to invalid id', async () => {
    const res = await reqGroceries
      .delete(`/groceries/${homeRef}/9999999`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'groceries.notFound',
      msg: 'groceries.notFound',
    });
  });

  it('should delete an article', async () => {
    const res = await reqGroceries
      .delete(`/groceries/${homeRef}/${groceries[0]}`)
      .set('Authorization', `Bearer ${USER.token}`);

    groceries.splice(0, 1);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'groceries.deleted',
      msg: 'groceries.deleted',
    });
  });

  it('should fail to soft delete an article due to invalid action', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/${groceries[0]}/notanaction`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'request.notFound',
      msg: 'request.notFound',
    });
  });

  it('should fail to soft delete an article due to invalid id', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/999999/delete`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      title: 'groceries.notFound',
      msg: 'groceries.notFound',
    });
  });

  it('should soft delete an article', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/${groceries[0]}/delete`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      article: {
        id: expect.toBeNumber(),
        description: expect.toBeString(),
        deletedAt: expect.toBeString(),
      },
    });
  });

  it('should soft delete the same article (no change should be made)', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/${groceries[0]}/delete`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      article: {
        id: expect.toBeNumber(),
        description: expect.toBeString(),
        deletedAt: expect.toBeString(),
      },
    });
  });

  it('should restore an article', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/${groceries[0]}/restore`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      article: {
        id: expect.toBeNumber(),
        description: expect.toBeString(),
        deletedAt: expect.toBeNil(),
      },
    });
  });

  it('should restore the same article (no change should be made)', async () => {
    const res = await reqGroceries
      .put(`/groceries/${homeRef}/${groceries[0]}/restore`)
      .set('Authorization', `Bearer ${USER.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      title: 'request.success',
      msg: 'request.success',
      article: {
        id: expect.toBeNumber(),
        description: expect.toBeString(),
        deletedAt: expect.toBeNil(),
      },
    });
  });

  afterAll(async () => {
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});
