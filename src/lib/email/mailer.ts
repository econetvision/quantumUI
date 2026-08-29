import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * SMTP mail transport.
 *
 * Configured entirely from environment variables so any provider works —
 * Gmail app passwords, SES, Mailgun, Postmark, a self-hosted relay. With
 * SMTP_HOST unset, email is cleanly disabled: every send becomes a logged
 * no-op rather than an error, because mail must never take down sign-in,
 * certificates or cron runs.
 *
 *   SMTP_HOST     e.g. smtp.gmail.com
 *   SMTP_PORT     587 (STARTTLS, default) or 465 (implicit TLS)
 *   SMTP_USER     username; blank for an unauthenticated relay
 *   SMTP_PASS     password / app password
 *   SMTP_FROM     e.g. "QuantumUI <no-reply@example.com>"; falls back to SMTP_USER
 */

const SMTP_HOST = (process.env.SMTP_HOST ?? '').trim();
const SMTP_PORT = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);
const SMTP_USER = (process.env.SMTP_USER ?? '').trim();
const SMTP_PASS = (process.env.SMTP_PASS ?? '').trim();
const SMTP_FROM = (process.env.SMTP_FROM ?? '').trim() || SMTP_USER;

export function isEmailEnabled(): boolean {
  return Boolean(SMTP_HOST && SMTP_FROM);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isEmailEnabled()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number.isFinite(SMTP_PORT) ? SMTP_PORT : 587,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative; derived from a crude strip of the HTML if omitted. */
  text?: string;
}

/**
 * Send one email. Returns true on acceptance by the relay, false when email is
 * disabled or the send failed — callers treat both the same way (carry on).
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.info(`[email] disabled — skipped "${options.subject}" to ${options.to}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text:
        options.text ??
        options.html
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
    });
    return true;
  } catch (error) {
    console.error(`[email] send failed ("${options.subject}" to ${options.to}):`, error);
    return false;
  }
}
