import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailDeliveryResult {
  sent: boolean;
  reason?: string;
  error?: string;
  code?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }
  private initializeTransporter(): void {
    const user = (env.SMTP_USER || env.SMTP_MAIL || '').trim();
    const pass = (env.SMTP_PASS || env.SMTP_PASSWORD || '').replace(/\s+/g, '');

    if (user && pass) {
      if (env.SMTP_SERVICE?.toLowerCase() === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user,
            pass,
          },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user,
            pass,
          },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
        });
      }
      this.isConfigured = true;
      console.log(`[EmailService] Transporter initialized for ${user} (${env.SMTP_SERVICE || env.SMTP_HOST})`);
    } else {
      console.warn(
        '[EmailService] SMTP credentials not fully configured. Email OTPs will be logged to server console for local development.'
      );
      this.isConfigured = false;
    }
  }

  private renderEjs(templateName: string, data: Record<string, any>): string {
    const candidatePaths = [
      path.resolve(__dirname, `../templates/emails/${templateName}.ejs`),
      path.resolve(process.cwd(), `src/templates/emails/${templateName}.ejs`),
      path.resolve(process.cwd(), `apps/api/src/templates/emails/${templateName}.ejs`),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const fileContent = fs.readFileSync(p, 'utf-8');
          return ejs.render(fileContent, data);
        } catch (err: any) {
          console.error(`[EmailService] Failed to render EJS template ${p}:`, err.message);
        }
      }
    }

    // High-fidelity inline fallback with individual highlighted digit boxes
    const isReset = templateName.includes('reset');
    const borderColor = isReset ? '#dc2626' : '#2563eb';
    const textColor = isReset ? '#991b1b' : '#1e3a8a';
    const bgContainer = isReset ? '#fef2f2' : '#eff6ff';

    const digits = data.otp ? String(data.otp).split('') : [];
    const digitBoxes = digits
      .map(
        (d: string) => `
        <td style="width: 44px; height: 52px; background: #ffffff; border: 2px solid ${borderColor}; border-radius: 8px; text-align: center; vertical-align: middle; font-size: 26px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: ${textColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${d}
        </td>`
      )
      .join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">${data.subject || 'ATS Resume Intelligence Studio'}</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">${isReset ? 'Use the following 6-digit recovery code to reset your password:' : 'Welcome! Please use the following 6-digit verification code to activate your account:'}</p>
        <div style="background: ${bgContainer}; padding: 24px 16px; border-radius: 12px; margin: 24px 0; text-align: center;">
          <table align="center" border="0" cellpadding="0" cellspacing="6" style="margin: 0 auto;">
            <tr>${digitBoxes}</tr>
          </table>
          <p style="margin-top: 12px; font-size: 12px; color: #64748b; font-weight: 600;">Expires in 5 minutes</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, please safely ignore this email.</p>
      </div>
    `;
  }

  public async sendVerificationOtp(email: string, otp: string, fullName?: string): Promise<EmailDeliveryResult> {
    const subject = `${otp} is your verification code - ATS Resume Studio`;
    const html = this.renderEjs('onboarding-otp', {
      subject,
      otp,
      fullName,
      expiryMinutes: 5,
    });
    const text = `Welcome to ATS Resume Intelligence Studio!\nYour 6-digit verification code is: ${otp}\nThis code expires in 5 minutes.`;

    return this.sendMail(email, subject, text, html, otp);
  }

  public async sendPasswordResetOtp(email: string, otp: string): Promise<EmailDeliveryResult> {
    const subject = `${otp} is your password recovery code - ATS Resume Studio`;
    const html = this.renderEjs('reset-password-otp', {
      subject,
      otp,
      expiryMinutes: 5,
    });
    const text = `Your ATS Resume Studio password recovery code is: ${otp}\nThis code expires in 5 minutes.`;

    return this.sendMail(email, subject, text, html, otp);
  }

  private async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    otpCode: string
  ): Promise<EmailDeliveryResult> {
    if (!this.isConfigured || !this.transporter) {
      console.log(`\n======================================================`);
      console.log(`[LOCAL DEV EMAIL DISPATCH - SMTP NOT CONFIGURED]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`>>> OTP CODE: [ ${otpCode} ] <<<`);
      console.log(`======================================================\n`);
      return {
        sent: false,
        reason: 'SMTP credentials not configured on server (SMTP_USER or SMTP_PASS missing).',
        code: 'SMTP_NOT_CONFIGURED',
      };
    }

    try {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Email successfully delivered to ${to} via Gmail SMTP`);
      return { sent: true };
    } catch (error: any) {
      console.error(`[EmailService] SMTP delivery failed for ${to}:`, error.message);
      console.warn(`[EmailService] OTP logged to server console below for manual retrieval:`);
      console.log(`\n======================================================`);
      console.log(`[SERVER OTP SECURITY LOG]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`>>> OTP CODE: [ ${otpCode} ] <<<`);
      console.log(`======================================================\n`);
      return {
        sent: false,
        reason: error.message || 'SMTP delivery rejected by mail server',
        error: error.message,
        code: error.code || 'SMTP_ERROR',
      };
    }
  }
}

export const emailService = new EmailService();
