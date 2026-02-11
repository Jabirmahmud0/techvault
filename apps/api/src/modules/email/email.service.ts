import { resend } from "../../config/resend.js";

export const emailService = {
    async sendWelcomeEmail(email: string, name: string) {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[Mock Email] Welcome email to ${email}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "TechVault <onboarding@resend.dev>", // Replace with your verified domain
                to: email,
                subject: "Welcome to TechVault!",
                html: `
          <h1>Welcome, ${name}!</h1>
          <p>Thanks for joining TechVault. We're excited to have you on board.</p>
          <p>Start browsing our latest collection of premium electronics today.</p>
        `,
            });
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    },

    async sendOrderConfirmation(email: string, orderId: string, total: string) {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[Mock Email] Order confirmation to ${email} for Order #${orderId}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "TechVault <onboarding@resend.dev>",
                to: email,
                subject: `Order Confirmation #${orderId.slice(0, 8)}`,
                html: `
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total:</strong> $${total}</p>
          <p>We'll notify you when your order ships.</p>
        `,
            });
        } catch (error) {
            console.error("Failed to send order confirmation email:", error);
        }
    },
};
