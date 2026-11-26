"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBloodRequestEmails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        return null;
    }
    if (host) {
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }
    // Fallback to Gmail service if GMAIL_USER / SMTP_USER without host
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
};
const sendBloodRequestEmails = async (donorEmails, payload) => {
    const uniqueEmails = Array.from(new Set(donorEmails.filter(Boolean)));
    if (uniqueEmails.length === 0) {
        return {
            configured: true,
            sentCount: 0,
            failedCount: 0,
            recipients: [],
            message: 'No matching donors with email addresses found in this area.',
        };
    }
    const transporter = createTransporter();
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
    if (!transporter) {
        console.warn(`[EmailService] SMTP/Gmail credentials not configured. Simulated blood alert email to ${uniqueEmails.length} donor(s): ${uniqueEmails.join(', ')}`);
        return {
            configured: false,
            sentCount: 0,
            failedCount: 0,
            recipients: uniqueEmails,
            message: `SMTP is not configured on the server; logged alert for ${uniqueEmails.length} donor(s).`,
        };
    }
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@medisure.in';
    let sentCount = 0;
    let failedCount = 0;
    await Promise.all(uniqueEmails.map(async (to) => {
        try {
            await transporter.sendMail({
                from: `MediSure Blood Bank <${fromAddress}>`,
                to,
                subject,
                text: textBody,
            });
            sentCount += 1;
        }
        catch (err) {
            console.error(`Failed to send blood alert email to ${to}:`, err);
            failedCount += 1;
        }
    }));
    return {
        configured: true,
        sentCount,
        failedCount,
        recipients: uniqueEmails,
        message: `Emailed ${sentCount} matching donor(s) in ${area}.`,
    };
};
exports.sendBloodRequestEmails = sendBloodRequestEmails;
