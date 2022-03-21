const faker = require('faker');
const db = require('../../db/models');

interface tUser {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
}

export const TEST_USER: { email: (suffix: string) => string; pwd: string } = {
  email: (suffix: string) => {
    return `cotulity-test-${suffix}@hotmail.com`;
  },
  pwd: '123123',
};

export const getTestUser = async (
  caller: string,
  basic?: boolean
): Promise<tUser> => {
  return basic
    ? { email: TEST_USER.email(caller), password: TEST_USER.pwd }
    : {
        email: TEST_USER.email(caller),
        password: TEST_USER.pwd,
        firstname: await faker.name.firstName(),
        lastname: await faker.name.lastName(),
        phone: await faker.phone.phoneNumber(),
      };
};

export const registerAndLogin = async (
  caller: string,
  request: any
): Promise<{ token: string; id: number }> => {
  try {
    let testUser = await getTestUser(caller);
    await request.post('/users/register').send(testUser);
    await setEmailVerifiedAt(testUser.email);
    let res = (
      await request.post('/auth/login').send(await getTestUser(caller, true))
    ).body;
    return { token: res.token, id: res.userId };
  } catch (error) {
    return { token: '', id: 0 };
  }
};

export const setEmailVerifiedAt = async (email: string) => {
  try {
    await db.User.update(
      { emailVerifiedAt: new Date() },
      { where: { email: email } }
    );
  } catch (error) {
    return false;
  }
};
