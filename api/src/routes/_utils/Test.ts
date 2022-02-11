const faker = require('faker');

export const TEST_USER: { email: (suffix: string) => string; pwd: string } = {
  email: (suffix: string) => {
    return `cotulity-test-${suffix}@hotmail.com`;
  },
  pwd: '123123',
};

export async function getTestUser(caller: string, basic?: boolean) {
  return basic
    ? { email: TEST_USER.email(caller), password: TEST_USER.pwd }
    : {
        email: TEST_USER.email(caller),
        password: TEST_USER.pwd,
        firstname: await faker.name.firstName(),
        lastname: await faker.name.lastName(),
        phone: await faker.phone.phoneNumber(),
      };
}
