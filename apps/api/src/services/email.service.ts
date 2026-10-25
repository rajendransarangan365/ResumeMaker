import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      this.isConfigured = true;
      console.log(`[EmailService] Transporter initialized for ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    } else {
      console.warn(
        '[EmailService] SMTP credentials not fully configured. Email OTPs will be logged to server console for local development.'
      );
      this.isConfigured = false;
    }
  }

  public async sendVerificationOtp(email: string, otp: string): Promise<boolean> {
    const subject = `${otp} is your verification code - ATS Resume Studio`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Welcome to ATS Resume Intelligence Studio</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">Please use the following 6-digit verification code to complete your registration:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 6px; border: 1px dashed #93c5fd;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for <strong>5 minutes</strong>. If you did not request this registration, please safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">ATS Resume Intelligence Studio • Automated Security Delivery</p>
      </div>
    `;

    const text = `Your ATS Resume Studio verification code is: ${otp}. It expires in 5 minutes.`;

    return this.sendMail(email, subject, text, html, otp);
  }

  public async sendPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    const subject = `${otp} is your password recovery code - ATS Resume Studio`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Password Recovery Request</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">We received a request to reset your password. Use the code below to proceed with resetting your credentials:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #dc2626; background: #fef2f2; padding: 12px 24px; border-radius: 6px; border: 1px dashed #fca5a5;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This recovery code is single-use and will expire in <strong>5 minutes</strong>. If you did not request a password reset, your account remains secure and no action is required.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">ATS Resume Intelligence Studio • Automated Security Delivery</p>
      </div>
    `;

    const text = `Your ATS Resume Studio password recovery code is: ${otp}. It expires in 5 minutes.`;

    return this.sendMail(email, subject, text, html, otp);
  }

  private async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    otpCode: string
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      // Local development simulation fallback
      console.log(`\n======================================================`);
      console.log(`[LOCAL DEV EMAIL DISPATCH]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`>>> OTP CODE: [ ${otpCode} ] <<<`);
      console.log(`======================================================\n`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error);
      return false;
    }
  }
}

export const emailService = new EmailService();
