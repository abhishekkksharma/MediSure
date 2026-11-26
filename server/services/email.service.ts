import nodemailer, { Transporter } from 'nodemailer';

export interface BloodAlertEmailPayload {
  requesterName: string;
  requesterEmail: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: string;
  city?: string;
  state?: string;
  hospitalName?: string;
  contactPhone?: string;
  requirements?: string;
}

export interface EmailDeliveryResult {
  configured: boolean;
  sentCount: number;
  failedCount: number;
  recipients: string[];
  sentRecipients: string[];
  failedRecipients: string[];
  previewUrls: string[];
  message: string;
}

const PLACEHOLDER_VALUES = new Set([
  'your_email@gmail.com',
  'your_app_password',
  'your-email@gmail.com',
  'your-app-password',
]);

const isConfiguredValue = (value?: string): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER_VALUES.has(trimmed.toLowerCase());
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getTransporter = async (): Promise<{
  transporter: Transporter;
  fromAddress: string;
  isTestAccount: boolean;
}> => {
  const host = process.env.SMTP_HOST?.trim();
  const parsedPort = Number(process.env.SMTP_PORT || 587);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.trim().toLowerCase() === 'true'
    : port === 465;

  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (isConfiguredValue(rawUser) && isConfiguredValue(rawPass)) {
    const user = rawUser.trim();
    const isGmail = !host || host.toLowerCase().includes('gmail');
    // Google displays 16-char App Passwords with spaces; strip spaces for Gmail SMTP
    const pass = isGmail ? rawPass.replace(/\s+/g, '') : rawPass.trim();

    const transporter = host
      ? nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });

    const configuredFrom = process.env.SMTP_FROM?.trim();
    return {
      transporter,
      fromAddress: isConfiguredValue(configuredFrom) ? configuredFrom : user,
      isTestAccount: false,
    };
  }

  // Fallback to Nodemailer's Ethereal test SMTP when no SMTP credentials are configured
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return {
    transporter,
    fromAddress: testAccount.user,
    isTestAccount: true,
  };
};

export const verifyEmailTransport = async (): Promise<{
  ok: boolean;
  isTestAccount: boolean;
  message: string;
}> => {
  try {
    const { transporter, isTestAccount } = await getTransporter();
    await transporter.verify();
    return {
      ok: true,
      isTestAccount,
      message: isTestAccount
        ? 'Connected to Nodemailer Ethereal test SMTP.'
        : 'SMTP transporter verified and ready.',
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Unknown SMTP error';
    return {
      ok: false,
      isTestAccount: false,
      message: `SMTP verification failed: ${reason}`,
    };
  }
};

export const sendBloodRequestEmails = async (
  donorEmails: string[],
  payload: BloodAlertEmailPayload
): Promise<EmailDeliveryResult> => {
  const uniqueEmails = Array.from(new Set(donorEmails.filter(Boolean)));
  if (uniqueEmails.length === 0) {
    return {
      configured: true,
      sentCount: 0,
      failedCount: 0,
      recipients: [],
      sentRecipients: [],
      failedRecipients: [],
      previewUrls: [],
      message: 'No matching donors with email addresses found in this area.',
    };
  }

  const area = [payload.city, payload.state].filter(Boolean).join(', ') || 'your area';
  const subject = `[MediSure ${payload.urgency.toUpperCase()}] ${payload.bloodGroup} Blood Donor Needed in ${area}`;

  const textBody = [
    `Urgent Blood Donation Request (${payload.bloodGroup})`,
    '',
    `Requester: ${payload.requesterName} (${payload.requesterEmail})`,
    `Blood Group Needed: ${payload.bloodGroup}`,
    `Units Required: ${payload.unitsRequired}`,
    `Urgency: ${payload.urgency.toUpperCase()}`,
    `Location: ${area}`,
    payload.hospitalName ? `Hospital: ${payload.hospitalName}` : null,
    payload.contactPhone ? `Contact Phone: ${payload.contactPhone}` : null,
    payload.requirements ? `Requirements: ${payload.requirements}` : null,
    '',
    'If you are able to donate, please reach out to the requester directly.',
    '— MediSure Emergency Blood Network',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const safeArea = escapeHtml(area);
  const safeRequesterName = escapeHtml(payload.requesterName);
  const safeRequesterEmail = escapeHtml(payload.requesterEmail);
  const safeBloodGroup = escapeHtml(payload.bloodGroup);
  const safeUrgency = escapeHtml(payload.urgency);
  const safeHospitalName = payload.hospitalName ? escapeHtml(payload.hospitalName) : null;
  const safeContactPhone = payload.contactPhone ? escapeHtml(payload.contactPhone) : null;
  const safeRequirements = payload.requirements ? escapeHtml(payload.requirements) : null;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #262029; max-width: 560px; margin: 0 auto; border: 1px solid #ececec; border-radius: 12px; padding: 20px;">
      <h2 style="margin: 0 0 12px; color: #b91c1c;">Urgent ${safeBloodGroup} Blood Donor Needed</h2>
      <p style="margin: 0 0 12px; font-size: 14px;">A patient in <strong>${safeArea}</strong> needs blood donation assistance.</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 14px;">
        <tr><td style="padding: 4px 0;"><strong>Requester:</strong></td><td>${safeRequesterName} (${safeRequesterEmail})</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Blood Group:</strong></td><td>${safeBloodGroup}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Units Required:</strong></td><td>${payload.unitsRequired}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Urgency:</strong></td><td style="text-transform: uppercase;">${safeUrgency}</td></tr>
        ${safeHospitalName ? `<tr><td style="padding: 4px 0;"><strong>Hospital:</strong></td><td>${safeHospitalName}</td></tr>` : ''}
        ${safeContactPhone ? `<tr><td style="padding: 4px 0;"><strong>Contact Phone:</strong></td><td>${safeContactPhone}</td></tr>` : ''}
        ${safeRequirements ? `<tr><td style="padding: 4px 0;"><strong>Requirements:</strong></td><td>${safeRequirements}</td></tr>` : ''}
      </table>
      <p style="margin: 0; font-size: 12px; color: #666;">Sent via MediSure Emergency Blood Network</p>
    </div>
  `;

  try {
    const { transporter, fromAddress, isTestAccount } = await getTransporter();
    await transporter.verify();

    const sentRecipients: string[] = [];
    const failedRecipients: string[] = [];
    const previewUrls: string[] = [];

    await Promise.all(
      uniqueEmails.map(async (to) => {
        try {
          const info = await transporter.sendMail({
            from: `MediSure Blood Bank <${fromAddress}>`,
            replyTo: payload.requesterEmail,
            to,
            subject,
            text: textBody,
            html: htmlBody,
          });
          sentRecipients.push(to);

          if (isTestAccount) {
            const url = nodemailer.getTestMessageUrl(info);
            if (url) previewUrls.push(url);
          }
        } catch (err) {
          console.error(`Failed to send blood alert email to ${to}:`, err);
          failedRecipients.push(to);
        }
      })
    );

    const sentCount = sentRecipients.length;
    const failedCount = failedRecipients.length;

    let message: string;
    if (sentCount === 0 && failedCount > 0) {
      message = `Failed to send blood alert email(s) to ${failedCount} donor(s) in ${area}. Check SMTP credentials.`;
    } else if (isTestAccount) {
      message = `Sent ${sentCount} test email(s) via Nodemailer Ethereal to donors in ${area}.`;
    } else if (failedCount > 0) {
      message = `Emailed ${sentCount} matching donor(s) in ${area} (${failedCount} failed).`;
    } else {
      message = `Emailed ${sentCount} matching donor(s) in ${area}.`;
    }

    return {
      configured: !isTestAccount,
      sentCount,
      failedCount,
      recipients: uniqueEmails,
      sentRecipients,
      failedRecipients,
      previewUrls,
      message,
    };
  } catch (err) {
    console.error('Nodemailer transport error:', err);
    const reason = err instanceof Error ? err.message : 'Unknown transport error';
    return {
      configured: false,
      sentCount: 0,
      failedCount: uniqueEmails.length,
      recipients: uniqueEmails,
      sentRecipients: [],
      failedRecipients: uniqueEmails,
      previewUrls: [],
      message: `Failed to initialize email transport for ${uniqueEmails.length} donor(s): ${reason}`,
    };
  }
};
