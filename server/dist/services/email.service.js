"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBloodRequestEmails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getTransporter = async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (user && pass) {
        const transporter = host
            ? nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            })
            : nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: { user, pass },
            });
        return {
            transporter,
            fromAddress: process.env.SMTP_FROM || user,
            isTestAccount: false,
        };
    }
    // Fallback to Nodemailer's Ethereal test SMTP when no SMTP credentials are configured
    const testAccount = await nodemailer_1.default.createTestAccount();
    const transporter = nodemailer_1.default.createTransport({
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
const sendBloodRequestEmails = async (donorEmails, payload) => {
    const uniqueEmails = Array.from(new Set(donorEmails.filter(Boolean)));
    if (uniqueEmails.length === 0) {
        return {
            configured: true,
            sentCount: 0,
            failedCount: 0,
            recipients: [],
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
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #262029; max-width: 560px; margin: 0 auto; border: 1px solid #ececec; border-radius: 12px; padding: 20px;">
      <h2 style="margin: 0 0 12px; color: #b91c1c;">Urgent ${payload.bloodGroup} Blood Donor Needed</h2>
      <p style="margin: 0 0 12px; font-size: 14px;">A patient in <strong>${area}</strong> needs blood donation assistance.</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 14px;">
        <tr><td style="padding: 4px 0;"><strong>Requester:</strong></td><td>${payload.requesterName} (${payload.requesterEmail})</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Blood Group:</strong></td><td>${payload.bloodGroup}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Units Required:</strong></td><td>${payload.unitsRequired}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Urgency:</strong></td><td style="text-transform: uppercase;">${payload.urgency}</td></tr>
        ${payload.hospitalName ? `<tr><td style="padding: 4px 0;"><strong>Hospital:</strong></td><td>${payload.hospitalName}</td></tr>` : ''}
        ${payload.contactPhone ? `<tr><td style="padding: 4px 0;"><strong>Contact Phone:</strong></td><td>${payload.contactPhone}</td></tr>` : ''}
        ${payload.requirements ? `<tr><td style="padding: 4px 0;"><strong>Requirements:</strong></td><td>${payload.requirements}</td></tr>` : ''}
      </table>
      <p style="margin: 0; font-size: 12px; color: #666;">Sent via MediSure Emergency Blood Network</p>
    </div>
  `;
    try {
        const { transporter, fromAddress, isTestAccount } = await getTransporter();
        let sentCount = 0;
        let failedCount = 0;
        const previewUrls = [];
        await Promise.all(uniqueEmails.map(async (to) => {
            try {
                const info = await transporter.sendMail({
                    from: `MediSure Blood Bank <${fromAddress}>`,
                    to,
                    subject,
                    text: textBody,
                    html: htmlBody,
                });
                sentCount += 1;
                if (isTestAccount) {
                    const url = nodemailer_1.default.getTestMessageUrl(info);
                    if (url)
                        previewUrls.push(url);
                }
            }
            catch (err) {
                console.error(`Failed to send blood alert email to ${to}:`, err);
                failedCount += 1;
            }
        }));
        return {
            configured: !isTestAccount,
            sentCount,
            failedCount,
            recipients: uniqueEmails,
            previewUrls,
            message: isTestAccount
                ? `Sent ${sentCount} test email(s) via Nodemailer Ethereal to donors in ${area}.`
                : `Emailed ${sentCount} matching donor(s) in ${area}.`,
        };
    }
    catch (err) {
        console.error('Nodemailer transport error:', err);
        return {
            configured: false,
            sentCount: 0,
            failedCount: uniqueEmails.length,
            recipients: uniqueEmails,
            previewUrls: [],
            message: `Failed to initialize email transport for ${uniqueEmails.length} donor(s).`,
        };
    }
};
exports.sendBloodRequestEmails = sendBloodRequestEmails;
