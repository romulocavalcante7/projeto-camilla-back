import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import config from "../config/config";
import logger from "../config/logger";

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendEmail = async (options: EmailOptions) => {
  const { to, subject, template, data } = options;

  // Obtenha o caminho para o arquivo de template do email
  const templatePath = path.join(__dirname, "../mails", `${template}.ejs`);

  // Renderize o template do email com o EJS
  const html: string = await ejs.renderFile(templatePath, data);

  const msg = {
    from: config.email.from,
    to,
    subject,
    html,
  };

  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @param {string} name
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string, name: string) => {
  const subject = "Redefinir Senha";
  const resetPasswordUrl = `${config.appUrl}/login/resetar-senha?token=${token}`;
  const template = "resetPassword";
  const data = { resetPasswordUrl, user: { name } };
  await sendEmail({ to, subject, template, data });
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = "Email Verification";
  const verificationEmailUrl = `${config.appUrl}/verify-email?token=${token}`;
  const template = "verifyEmail";
  const data = { verificationEmailUrl };
  await sendEmail({ to, subject, template, data });
};

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
