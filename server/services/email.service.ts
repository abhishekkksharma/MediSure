import dns from 'dns';
import net from 'net';
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

const TRANSIENT_SOCKET_CODES = new Set([
  'ESOCKET',
  'ETIMEDOUT',
  'ENETUNREACH',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
]);

const isTransientSocketError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const record = err as { code?: string; originalCode?: string };
  return (
    (typeof record.code === 'string' && TRANSIENT_SOCKET_CODES.has(record.code)) ||
    (typeof record.originalCode === 'string' && TRANSIENT_SOCKET_CODES.has(record.originalCode))
  );
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !isTransientSocketError(err)) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw lastError;
};

/**
 * Resolve an SMTP hostname to IPv4 so Nodemailer does not attempt unreachable IPv6
 * routes first and hit Node's short autoSelectFamily timeout.
 */
const resolveIPv4Host = async (hostname: string): Promise<string> => {
  if (net.isIP(hostname) !== 0) return hostname;
  try {
    const { address } = await dns.promises.lookup(hostname, { family: 4 });
    return address;
  } catch {
    return hostname;
  }
};

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
    const effectiveHost = host || 'smtp.gmail.com';
    const isGmail = effectiveHost.toLowerCase().includes('gmail');
    // Google displays 16-char App Passwords with spaces; strip spaces for Gmail SMTP
    const pass = isGmail ? rawPass.replace(/\s+/g, '') : rawPass.trim();
    const connectHost = await resolveIPv4Host(effectiveHost);

    const transporter = nodemailer.createTransport({
      host: connectHost,
      port,
      secure,
      pool: true,
      maxConnections: 1,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: connectHost !== effectiveHost ? { servername: effectiveHost } : undefined,
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
  let transporter: Transporter | null = null;
  try {
    const setup = await getTransporter();
    transporter = setup.transporter;
    await withRetry(() => setup.transporter.verify());
    return {
      ok: true,
      isTestAccount: setup.isTestAccount,
      message: setup.isTestAccount
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
  } finally {
    transporter?.close();
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
    <div style="margin: 0; padding: 32px 16px; background-color: #F6E2E9; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #262029;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ece4eb; border-radius: 24px; padding: 28px; box-shadow: 0 16px 40px rgba(70, 32, 62, 0.08);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #231d25;">
            Medi<span style="color: #db2777;">Sure</span>
          </span>
          <span style="display: inline-block; background-color: #fae78c; color: #2b242c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 5px 12px; border-radius: 999px;">
            ${safeUrgency} Blood Alert
          </span>
        </div>

        <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #28222a; letter-spacing: -0.02em;">
          Urgent <span style="color: #db2777;">${safeBloodGroup}</span> Blood Donor Needed
        </h2>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.5; color: #5c4f5f;">
          A patient in <strong style="color: #262029;">${safeArea}</strong> urgently needs blood donation assistance.
        </p>

        <div style="background-color: #f7eef5; border: 1px solid #ece4eb; border-radius: 16px; padding: 16px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse; color: #262029;">
            <tr>
              <td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600; width: 38%;">Blood Group</td>
              <td style="padding: 6px 0; font-weight: 700; color: #db2777;">${safeBloodGroup}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600;">Units Required</td>
              <td style="padding: 6px 0; font-weight: 600;">${payload.unitsRequired}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600;">Location</td>
              <td style="padding: 6px 0;">${safeArea}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600;">Requester</td>
              <td style="padding: 6px 0;">${safeRequesterName} (${safeRequesterEmail})</td>
            </tr>
            ${safeHospitalName ? `<tr><td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600;">Hospital</td><td style="padding: 6px 0;">${safeHospitalName}</td></tr>` : ''}
            ${safeContactPhone ? `<tr><td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600;">Contact Phone</td><td style="padding: 6px 0; font-weight: 600;">${safeContactPhone}</td></tr>` : ''}
            ${safeRequirements ? `<tr><td style="padding: 6px 8px 6px 0; color: #6c5c70; font-weight: 600; vertical-align: top;">Notes</td><td style="padding: 6px 0;">${safeRequirements}</td></tr>` : ''}
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 18px;">
          <a href="mailto:${safeRequesterEmail}" style="display: inline-block; background-color: #262029; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 12px;">
            Respond to Requester
          </a>
        </div>

        <p style="margin: 0; font-size: 12px; color: #6c5c70; text-align: center; border-top: 1px solid #ece4eb; padding-top: 14px;">
          Sent via MediSure Emergency Blood Donor Network
        </p>
      </div>
    </div>
  `;

  let activeTransporter: Transporter | null = null;
  try {
    const { transporter, fromAddress, isTestAccount } = await getTransporter();
    activeTransporter = transporter;
    await withRetry(() => transporter.verify());

    const sentRecipients: string[] = [];
    const failedRecipients: string[] = [];
    const previewUrls: string[] = [];

    await Promise.all(
      uniqueEmails.map(async (to) => {
        try {
          const info = await withRetry(() =>
            transporter.sendMail({
              from: `MediSure Blood Bank <${fromAddress}>`,
              replyTo: payload.requesterEmail,
              to,
              subject,
              text: textBody,
              html: htmlBody,
            })
          );
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
  } finally {
    activeTransporter?.close();
  }
};
