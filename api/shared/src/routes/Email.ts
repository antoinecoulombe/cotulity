require('dotenv').config({ path: '../../.env' });

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

const SENDER = 'cotulity-help@outlook.com';
export const email = {
  sender: SENDER,
  defaultConfig: {
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  },
};

/**
 * Sends an email.
 * @param sendMailOptions Email options to be passed to the 'sendMail' method of nodemailer.
 * @param transportConfig Email configuration to be passed to the 'createTransport' method of nodemailer.
 * @param forceSend Boolean indicating if the method should still send email while in test environment.
 * @returns A promise to return an object indicating whether the email was sent or not.
 */
export const sendEmail = async (
  sendMailOptions: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
  },
  transportConfig?: any,
  forceSend?: boolean
): Promise<{ success: boolean; title: string; msg: string }> => {
  let success = {
    success: true,
    title: 'homes.invitationSent',
    msg: 'homes.invitationSent',
  };

  if (process.env.NODE_ENV === 'test' && forceSend !== true) return success;

  return await nodemailer
    .createTransport(sgTransport(transportConfig ?? email.defaultConfig))
    .sendMail(sendMailOptions)
    .then(() => {
      return success;
    })
    .catch(() => {
      return {
        success: false,
        title: 'homes.emailDidNotSend',
        msg: 'request.error',
      };
    });
};
