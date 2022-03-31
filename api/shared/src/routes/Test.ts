require('dotenv').config({ path: '../../.env' });

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
  request: any,
  skipEmailVerification?: boolean
): Promise<{ token: string; id: number }> => {
  try {
    let testUser = await getTestUser(caller);
    await request.post('/users/register').send(testUser);
    if (skipEmailVerification !== true)
      await setEmailVerifiedAt(caller, request);

    let res = (
      await request.post('/auth/login').send(await getTestUser(caller, true))
    ).body;
    return { token: res.token, id: res.userId };
  } catch (error) {
    return { token: '', id: 0 };
  }
};

export const setEmailVerifiedAt = async (
  caller: string,
  request: any
): Promise<{ res: any; token: string | null }> => {
  try {
    // Get user with caller email
    let user = await db.User.findOne({
      where: { email: (await getTestUser(caller)).email },
    });
    if (!user)
      return { res: 'setEmailVerifiedAt: User not found', token: null };

    // Try logging in to 'send' verification email
    await request.post('/auth/login').send(await getTestUser(caller, true));

    // Get verification email
    let verifEmail = await db.VerificationEmail.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });
    if (!verifEmail)
      return {
        res: 'setEmailVerifiedAt: Verification Email not found',
        token: null,
      };

    // Verify user with token from verification email
    return {
      res: await request.put(`/users/public/verify/${verifEmail.token}`).send(),
      token: verifEmail.token,
    };
  } catch (error) {
    return { res: 'setEmailVerifiedAt: An error occured', token: null };
  }
};

export const getIp = (service: string) => {
  switch (service) {
    case 'auth':
      return process.env.IP_AUTH + ':' + process.env.PORT_AUTH;
    case 'global':
      return process.env.IP_GLOBAL + ':' + process.env.PORT_GLOBAL;
    case 'groceries':
      return process.env.IP_GROCERIES + ':' + process.env.PORT_GROCERIES;
    case 'homes':
      return process.env.IP_HOMES + ':' + process.env.PORT_HOMES;
    case 'tasks':
      return process.env.IP_TASKS + ':' + process.env.PORT_TASKS;
    case 'accounts':
      return process.env.IP_ACCOUNTS + ':' + process.env.PORT_ACCOUNTS;
    case 'calendar':
      return process.env.IP_CALENDAR + ':' + process.env.PORT_CALENDAR;
    default:
      return '127.0.0.1';
  }
};
