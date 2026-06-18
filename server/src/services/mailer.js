import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'mailhog';
const smtpPort = Number(process.env.SMTP_PORT || 1025);
const smtpFrom = process.env.SMTP_FROM || 'noreply@popilot.local';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  ignoreTLS: true,
});

export async function sendWelcomeEmail({ to, name }) {
  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: 'Bienvenue sur Popilot',
    html: `
      <h2>Bienvenue ${name} !</h2>
      <p>Votre compte Popilot a été créé avec succès.</p>
      <p><a href="${frontendUrl}">Accéder à Popilot</a></p>
    `,
  });
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: 'Réinitialisation de votre mot de passe Popilot',
    html: `
      <h2>Bonjour ${name},</h2>
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure.</p>
    `,
  });
}
