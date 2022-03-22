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

export const sendEmail = async (
  mailOptions: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
  },
  config?: any,
  forceSend?: boolean
): Promise<{ success: boolean; title: string; msg: string }> => {
  let success = {
    success: true,
    title: 'homes.invitationSent',
    msg: 'homes.invitationSent',
  };

  if (process.env.NODE_ENV === 'test' && forceSend !== true) return success;

  return await nodemailer
    .createTransport(sgTransport(config ?? email.defaultConfig))
    .sendMail(mailOptions)
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
