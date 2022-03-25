import 'jest';
import 'jest-extended';
import 'jest-extended/all';
import { email, sendEmail } from '../../../shared/src/routes/Email';

describe('noci-mail', () => {
  it('should send an email', async () => {
    const res = await sendEmail(
      {
        from: email.sender,
        to: 'coulombe.antoine@hotmail.com',
        subject: `Cotulity 'noci-mail' Test Case`,
        html: `This email was sent from a test case in 'noci-mail'. Please ignore.`,
      },
      undefined,
      true
    );

    expect(res).toEqual({
      success: true,
      title: 'homes.invitationSent',
      msg: 'homes.invitationSent',
    });
  });
});
