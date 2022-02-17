const faker = require('faker');

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
