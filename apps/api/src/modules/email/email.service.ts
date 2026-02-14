import { Resend } from "resend";
import { env } from "../../config/env.js"; // Note: .js extension for local dev
import nodemailer from "nodemailer";

// Initialize Resend (Keep it if needed later, or remove)
const resend = new Resend(env.RESEND_API_KEY || "re_123456789");

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const emailService = {
    async sendWelcomeEmail(email: string, name: string) {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`[Mock Email] Welcome email to ${email}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: env.SMTP_FROM || '"TechVault" <noreply@techvault.com>',
                to: email,
                subject: "Welcome to TechVault",
                html: `<h1>Welcome, ${name}!</h1><p>We're glad to have you.</p>`,
            });
            console.log(`[Email Service] Welcome email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    },

    async sendOrderConfirmationEmail(email: string, orderId: string, total: number) {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`[Mock Email] Order Confirmation to ${email} for Order #${orderId}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: env.SMTP_FROM || '"TechVault" <noreply@techvault.com>',
                to: email,
                subject: `Order Confirmation #${orderId}`,
                html: `<h1>Order Confirmed!</h1><p>Your order #${orderId} for $${total} has been received.</p>`,
            });
            console.log(`[Email Service] Order confirmation sent to ${email}`);
        } catch (error) {
            console.error("Failed to send order email:", error);
        }
    },

    async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
        console.log(`[Email Service] Password reset for ${email}: ${resetUrl}`);

        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`[Mock Email] Password reset to ${email}: ${resetUrl} (SMTP not configured)`);
            return;
        }

        try {
            await transporter.sendMail({
                from: env.SMTP_FROM || '"TechVault" <noreply@techvault.com>',
                to: email,
                subject: "Reset Your Password - TechVault",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
            <p style="font-size: 16px; color: #555;">Hi ${name},</p>
            <p style="font-size: 16px; color: #555;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #999; text-align: center;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
            });
            console.log(`[Email Service] Password reset email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send password reset email:", error);
        }
    },

    async sendVerificationEmail(email: string, name: string, otp: string) {
        console.log(`[Email Service] Attempting to send verification OTP to: ${email}`);

        // Log the OTP for development/debugging purposes (fallback if email fails)
        console.log(`[Email Service] Verification OTP: ${otp}`);

        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`[Mock Email] Verification OTP to ${email}: ${otp} (SMTP not configured)`);
            return;
        }

        try {
            console.log(`[Email Service] Sending via Gmail SMTP...`);
            const info = await transporter.sendMail({
                from: env.SMTP_FROM || '"TechVault" <noreply@techvault.com>',
                to: email,
                subject: "Your Verification Code - TechVault",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
            <p style="font-size: 16px; color: #555;">Hi ${name},</p>
            <p style="font-size: 16px; color: #555;">Use the code below to verify your TechVault account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #6366f1; background: #f0f0ff; padding: 10px 20px; border-radius: 5px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #999; text-align: center;">
              This code expires in 15 minutes. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `,
            });
            console.log(`[Email Service] Email sent successfully. Message ID: ${info.messageId}`);
        } catch (error) {
            console.error("Failed to send verification email:", error);
        }
    },

    async sendShippingUpdateEmail(email: string, orderId: string, trackingNumber: string) {
        console.log(`[Mock Email] Shipping update for order ${orderId} to ${email}. Tracking: ${trackingNumber}`);
    }
};
