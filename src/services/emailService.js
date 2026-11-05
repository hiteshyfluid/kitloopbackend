const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const prisma = require('../lib/prisma');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const gmailTransporter = gmailUser && gmailPass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })
  : null;

// ─── Email sending (Gmail SMTP, then Resend, then console) ───

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM
    || (gmailUser ? `The Kit Loop <${gmailUser}>` : 'The Kit Loop <no-reply@kitloop.app>');

  if (gmailTransporter) {
    await gmailTransporter.sendMail({ from, to, subject, html, text });
    return;
  }

  if (resend) {
    const { error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  console.log(`[email:dev] To: ${to} | Subject: ${subject}\n${text || html}`);
}

// Logo uploaded in Admin → Branding; emails fall back to a text wordmark
async function getEmailLogoUrl() {
  const row = await prisma.siteSetting
    .findUnique({ where: { settingKey: 'site_logo_url' } })
    .catch(() => null);
  const url = row?.settingValue;
  return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

function clientUrl() {
  return (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
}

module.exports = { sendEmail, getEmailLogoUrl, clientUrl };
