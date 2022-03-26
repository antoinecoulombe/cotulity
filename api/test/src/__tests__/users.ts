import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { getIp, registerAndLogin } from '../../../shared/src/routes/Test';

// Supertest
import supertest from 'supertest';
const reqGlobal = supertest(getIp('global'));

describe('users', () => {
  const CALLER = 'users';
  var USER = { token: '', id: 0 };

  beforeAll(async () => {
    USER = await registerAndLogin(CALLER, reqGlobal);
  });

  // TODO: delete when adding another test
  it('should do nothing', async () => {
    expect(1).toEqual(1);
  });

  afterAll(async () => {
    await reqGlobal
      .delete('/users/delete')
      .set('Authorization', `Bearer ${USER.token}`);
  });
});