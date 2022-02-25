const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getTestUser } from '../../../shared/src/routes/_utils/Test';

// Supertest
import supertest from 'supertest';
const request = supertest(app);

describe('users', () => {
  const CALLER = 'users';
  var TOKEN = '';

  beforeAll(async () => {
    await request.post('/users/register').send(await getTestUser(CALLER));
    TOKEN = (
      await request.post('/auth/login').send(await getTestUser(CALLER, true))
    ).body.token;
  });

  // TODO: delete when adding another test
  it('should do nothing', async () => {
    expect(1).toEqual(1);
  });

  afterAll(async () => {
    await request
      .delete('/users/delete')
      .set('Authorization', `Bearer ${TOKEN}`);
  });
});
