import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@ownvibes.in';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ownvibes.in'; // Default fallback for bcc

// Helper to format currency
const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;

/**
 * Base email layout wrapper
 */
const getEmailLayout = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Card Container -->
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            
            <!-- Header -->
            <div style="text-align: center; padding-bottom: 25px; border-bottom: 1px solid #f0f0f0; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #111111; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">OWNVIBES</h1>
            </div>
            
            <!-- Body Content -->
            <div style="color: #444444; font-size: 16px; line-height: 1.6;">
                ${content}
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0; color: #888888; font-size: 13px; margin-bottom: 10px;">
                    Questions? Reach out to our support team.
                </p>
                <div style="margin-bottom: 15px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color: #cf7e28; text-decoration: none; font-weight: bold; font-size: 14px; margin: 0 10px;">Shop</a>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-orders" style="color: #cf7e28; text-decoration: none; font-weight: bold; font-size: 14px; margin: 0 10px;">My Orders</a>
                </div>
                <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Ownvibes. All rights reserved.
                </p>
            </div>
            
        </div>
    </div>
</body>
</html>
`;

/**
 * Sends the Order Placed Email
 */
export const sendOrderPlacedEmail = async (user, order) => {
    if (!user || !user.email) return;

    try {
        const itemRows = order.orderItems.map(item => `
            <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f9f9f9; width: 65px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background-color: #f5f5f5;" />
                </td>
                <td style="padding: 15px 15px; border-bottom: 1px solid #f9f9f9; vertical-align: middle;">
                    <div style="font-weight: 600; color: #111; margin-bottom: 4px;">${item.name}</div>
                    <div style="color: #777; font-size: 13px;">Qty: ${item.qty}</div>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #f9f9f9; text-align: right; vertical-align: middle; font-weight: 600; color: #111;">
                    ${formatPrice(item.price)}
                </td>
            </tr>
        `).join('');

        const content = `
            <h2 style="color: #111; font-size: 22px; font-weight: 600; margin-top: 0;">Thank you for your order!</h2>
            <p style="margin-bottom: 25px;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin-bottom: 30px;">We're getting your order <strong>#${order._id}</strong> ready to be shipped. We will notify you when it has been sent.</p>
            
            <h3 style="color: #111; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #111;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tbody>
                    ${itemRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 20px 15px 0 0; text-align: right; font-weight: 600; color: #555;">Subtotal:</td>
                        <td style="padding: 20px 0 0 0; text-align: right; font-weight: 600; color: #111;">${formatPrice(order.totalPrice)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 10px 15px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #111;">Total:</td>
                        <td style="padding: 10px 0 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #cf7e28;">${formatPrice(order.totalPrice)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 10px;">
                <h3 style="color: #111; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 10px;">Shipping To</h3>
                <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Ownvibes" <${FROM_EMAIL}>`,
            to: user.email,
            bcc: ADMIN_EMAIL, // BCC admin on order placed
            subject: `Order Confirmation - #${order._id}`,
            html: getEmailLayout(`Order Confirmation`, content),
        });

        console.log(`✅ Order Placed Email sent to ${user.email} (BCC: ${ADMIN_EMAIL})`);
    } catch (error) {
        console.error(`❌ Failed to send Order Placed Email:`, error.message);
    }
};

/**
 * Sends the Order Shipped Email
 */
export const sendOrderShippedEmail = async (user, order) => {
    if (!user || !user.email) return;

    try {
        const trackingUpdate = order.trackingUpdates.slice().reverse().find(u => u.status === 'Shipped');
        const trackingDetails = trackingUpdate?.description ? `<div style="background-color: #f0f7f4; border: 1px solid #d4ece3; border-radius: 6px; padding: 15px; margin: 25px 0;"><strong style="color: #2b7a5a;">Tracking Info:</strong> <span style="color: #3e9a74;">${trackingUpdate.description}</span></div>` : '';

        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #111; color: #fff; width: 60px; height: 60px; line-height: 60px; border-radius: 30px; font-size: 24px; margin: 0 auto 20px;">📦</div>
                <h2 style="color: #111; font-size: 24px; font-weight: 700; margin-top: 0;">It's on the way!</h2>
            </div>
            
            <p style="margin-bottom: 15px;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin-bottom: 25px;">Great news! Your order <strong>#${order._id}</strong> has been shipped and is currently making its way to you.</p>
            
            ${trackingDetails}

            <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #111; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 10px;">Shipping To</h3>
                <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                </p>
            </div>

            <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-orders" style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 600; font-size: 15px; letter-spacing: 1px; text-transform: uppercase;">Track Order</a>
            </div>
        `;

        await transporter.sendMail({
            from: `"Ownvibes" <${FROM_EMAIL}>`,
            to: user.email,
            subject: `Your order #${order._id} has shipped!`,
            html: getEmailLayout(`Order Shipped`, content),
        });

        console.log(`✅ Order Shipped Email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send Order Shipped Email:`, error.message);
    }
};

/**
 * Sends the Order Delivered Email
 */
export const sendOrderDeliveredEmail = async (user, order) => {
    if (!user || !user.email) return;

    try {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #cf7e28; color: #fff; width: 60px; height: 60px; line-height: 60px; border-radius: 30px; font-size: 24px; margin: 0 auto 20px;">🎉</div>
                <h2 style="color: #111; font-size: 24px; font-weight: 700; margin-top: 0;">Delivered!</h2>
            </div>
            
            <p style="margin-bottom: 15px;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin-bottom: 25px;">Your order <strong>#${order._id}</strong> has been successfully delivered.</p>
            
            <p style="margin-bottom: 35px; font-size: 18px; color: #555; text-align: center; font-style: italic;">
                "We hope you love your new Ownvibes apparel as much as we loved creating it for you."
            </p>
            
            <div style="background-color: #fffaf0; border: 1px solid #f5eadb; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <h3 style="color: #cf7e28; margin-top: 0; font-size: 18px;">How did we do?</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Your feedback helps us improve and helps others make great choices.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-orders" style="display: inline-block; background-color: #cf7e28; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px;">Leave a Review</a>
            </div>

            <p style="color: #888; font-size: 13px; text-align: center;">If you haven't received your package, please reply to this email to contact support immediately.</p>
        `;

        await transporter.sendMail({
            from: `"Ownvibes" <${FROM_EMAIL}>`,
            to: user.email,
            subject: `Your order #${order._id} has been delivered!`,
            html: getEmailLayout(`Order Delivered`, content),
        });

        console.log(`✅ Order Delivered Email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send Order Delivered Email:`, error.message);
    }
};
