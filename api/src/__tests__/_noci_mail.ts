const app = require('../app.ts');
import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { sendEmail } from '../routes/_utils/Email';

describe('noci-mail', () => {
  it('should fail to send an email', async () => {
    const res = await sendEmail(
      {
        from: 'cotulity.invitations@outlook.com',
        to: 'cotulity-test-2@hotmail.com',
        subject: `Testing emails - ignore`,
        html: 'test html',
      },
      {
        host: 'smtp-mail.outlook.com',
        secureConnection: false,
        connectionTimeout: 1000, // 8s
        port: 587,
        tls: {
          ciphers: 'SSLv3',
        },
        auth: {
          user: 'cotulity.invitations@outlook.com',
          pass: '123456',
        },
      }
    );

    expect(res).toEqual({
      success: false,
      title: 'homes.emailDidNotSend',
      msg: 'request.error',
    });
  });
});
