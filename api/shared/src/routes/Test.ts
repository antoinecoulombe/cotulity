/**
 * Contains helper functions for jest tests.
 */

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
  /**
   * Appends a suffix to the default test email.
   * @param suffix The suffix to be appended to the email.
   * @returns An email address with the suffix appended.
   */
  email: (suffix: string) => {
    return `cotulity-test-${suffix}@hotmail.com`;
  },
  pwd: '123123',
};

/**
 * Generates a test user for registration and login.
 * @param caller A string identifying where the method was called from.
 * This is used to create a user with a "unique" username in case multiple tests are ran simultaneously.
 * @param justLogin A boolean indicating if only the username and password should be returned.
 * @returns A promise to return an object containing the information needed to create a new user.
 */
export const getTestUser = async (
  caller: string,
  justLogin?: boolean
): Promise<tUser> => {
  return justLogin
    ? { email: TEST_USER.email(caller), password: TEST_USER.pwd }
    : {
        email: TEST_USER.email(caller),
        password: TEST_USER.pwd,
        firstname: await faker.name.firstName(),
        lastname: await faker.name.lastName(),
        phone: await faker.phone.phoneNumber(),
      };
};

/**
 * Registers a new test user and gets a login token. Bypasses the need for a verification email.
 * @param caller A string identifying where the method was called from.
 * This is used to create a user with a "unique" username in case multiple tests are ran simultaneously.
 * @param request The supertest object to use for the registration and login.
 * @returns A promise to return an object containing the login token and user id. If an error occurs, {token: '', id: 0} is returned.
 */
export const registerAndLogin = async (
  caller: string,
  request: any
): Promise<{ token: string; id: number }> => {
  try {
    let testUser = await getTestUser(caller);
    await request.post('/users/register').send(testUser);
    await setEmailVerifiedAt(caller, request);

    let res = (
      await request.post('/auth/login').send(await getTestUser(caller, true))
    ).body;
    return { token: res.token, id: res.userId };
  } catch (error) {
    return { token: '', id: 0 };
  }
};

/**
 * Sends a "mock" verification email and verifies the user.
 * @param caller A string identifying where the method was called from.
 * This is used to get the correct test user.
 * @param request The supertest object to use for the registration and login.
 * @returns A promise to return an object containing the verification email token
 * and the response received from the supertest request.
 */
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

/**
 * Gets the ip address, with port, of the different services depending on environment values.
 * @param service The service name to get ip from. This name is found in the api service path itself, as follow: /api/SERVICE_NAME/*.
 * @returns The service's ip and port, formatted as: 'ip:port'.
 */
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
