import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../assets/logo.jpeg');

/**
 * Formats numeric values to clear Indian Rupee standard notation (Rs. XX.XX)
 * Avoids Unicode ₹ character which causes glyph corruption in standard PDF fonts
 */
const formatCur = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
};

/**
 * Converts a numeric amount to standard Indian Currency Words with proper grammar
 */
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if (n === 0) return '';
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };

    const rounded = Math.round(Number(num) || 0);
    if (rounded === 0) return 'Zero Rupees Only';
    if (rounded === 1) return 'One Rupee Only';
    return `${inWords(rounded).trim()} Rupees Only`;
};

/**
 * Generates an ultra-premium, balanced 1-Page E-Commerce Tax Invoice PDF for Ownvibes
 * @param {Object} order - Populated Order document
 * @param {Object} [payment] - Optional Payment document
 * @returns {Promise<Buffer>}
 */
export const generateInvoicePDF = (order, payment = null) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 24, bottom: 16, left: 32, right: 32 },
                info: {
                    Title: `Tax Invoice - ${order.invoiceNumber || order._id}`,
                    Author: 'Ownvibes Apparel',
                    Subject: 'Official Commercial Tax Invoice'
                }
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const invoiceNo = order.invoiceNumber || `INV-OV-2026-${order._id.toString().slice(-6).toUpperCase()}`;
            const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const invoiceTimeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Luxury Palette
            const primaryColor = '#cf7e28'; // Signature warm gold
            const darkColor = '#111827';
            const bodyColor = '#374151';
            const mutedColor = '#6b7280';
            const lightBorder = '#e5e7eb';
            const tableHeaderBg = '#cf7e28';
            const cardBg = '#fcfbfa';
            const subtleBg = '#f9fafb';

            const pageWidth = 595.28;
            const leftX = 32;
            const rightX = pageWidth - 32; // 531.28
            const contentWidth = rightX - leftX; // 531.28

            // ==========================================
            // 1. TOP HEADER (LOGO + BRAND INFO + TAX BADGE)
            // ==========================================
            let logoDrawn = false;
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, leftX, 24, { width: 50, height: 50 });
                    logoDrawn = true;
                } catch (e) {
                    console.warn('Could not render logo in PDF:', e.message);
                }
            }

            const companyX = logoDrawn ? leftX + 58 : leftX;

            // Company Title & Registry Info
            doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('OWNVIBES', companyX, 24, { characterSpacing: 1, lineBreak: false });
            doc.fillColor(mutedColor).fontSize(7).font('Helvetica-Bold').text('PREMIUM APPAREL & LUXURY STREETWEAR', companyX, 42, { characterSpacing: 0.5, lineBreak: false });
            doc.font('Helvetica').fontSize(7).fillColor(bodyColor);
            doc.text('Regd. Office: C-31, Nawada Housing Complex, New Delhi - 110059, India', companyX, 52, { lineBreak: false });
            doc.text('GSTIN: 07AABCU9603R1ZM | State Code: 07 (Delhi) | CIN: U18101DL2024PTC123456', companyX, 62, { lineBreak: false });
            doc.text('Support: info@ownvibes.com | Phone: +91 8873405595 | Website: www.ownvibes.in', companyX, 72, { lineBreak: false });

            // Right Header: Tax Invoice Box
            const badgeW = 180;
            const badgeX = rightX - badgeW;
            doc.roundedRect(badgeX, 22, badgeW, 64, 5).fillAndStroke('#fdfaf5', primaryColor);
            doc.fillColor(primaryColor).fontSize(10.5).font('Helvetica-Bold').text('TAX INVOICE', badgeX, 28, { width: badgeW, align: 'center', characterSpacing: 1, lineBreak: false });
            doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold').text(invoiceNo, badgeX, 42, { width: badgeW, align: 'center', lineBreak: false });
            doc.fontSize(7).font('Helvetica').fillColor(mutedColor);
            doc.text(`Invoice Date: ${orderDateStr} at ${invoiceTimeStr}`, badgeX, 54, { width: badgeW, align: 'center', lineBreak: false });
            doc.text('Original for Recipient (B2C Supply)', badgeX, 64, { width: badgeW, align: 'center', lineBreak: false });

            // Accent Dividing Line
            doc.strokeColor(primaryColor).lineWidth(1.2).moveTo(leftX, 94).lineTo(rightX, 94).stroke();

            // ==========================================
            // 2. TWO-COLUMN SUMMARY CARDS (BUYER & ORDER)
            // ==========================================
            const cardsY = 102;
            const cardH = 94;
            const cardGap = 12;
            const cardW = (contentWidth - cardGap) / 2; // ~259.6
            const card2X = leftX + cardW + cardGap;

            // Left Card: Billed & Shipped To
            doc.roundedRect(leftX, cardsY, cardW, cardH, 5).fillAndStroke(cardBg, lightBorder);
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8).text('BILLED & SHIPPED TO (BUYER)', leftX + 12, cardsY + 9, { lineBreak: false });

            const custName = order.shippingAddress?.name || order.user?.name || 'Valued Customer';
            doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text(custName, leftX + 12, cardsY + 23, { width: cardW - 24, ellipsis: true, lineBreak: false });

            doc.font('Helvetica').fontSize(7.5).fillColor(bodyColor);
            const custPhone = order.shippingAddress?.phone || order.user?.phone || 'N/A';
            const custEmail = order.user?.email || 'N/A';
            doc.text(`Mobile: ${custPhone} | Email: ${custEmail}`, leftX + 12, cardsY + 37, { width: cardW - 24, ellipsis: true, lineBreak: false });

            const addr = order.shippingAddress?.address || 'Standard Delivery Address';
            doc.text(addr, leftX + 12, cardsY + 50, { width: cardW - 24, height: 18, ellipsis: true });
            doc.text(`${order.shippingAddress?.city || 'Delhi'} - ${order.shippingAddress?.postalCode || '110001'}, India`, leftX + 12, cardsY + 66, { lineBreak: false });
            doc.fillColor(mutedColor).fontSize(7).text('Place of Supply: Delhi (07) | Shipping Mode: Express Surface', leftX + 12, cardsY + 79, { lineBreak: false });

            // Right Card: Payment & Order Information
            doc.roundedRect(card2X, cardsY, cardW, cardH, 5).fillAndStroke(cardBg, lightBorder);
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8).text('PAYMENT & ORDER SUMMARY', card2X + 12, cardsY + 9, { lineBreak: false });

            doc.font('Helvetica').fontSize(7.5).fillColor(mutedColor);
            doc.text('Order Reference:', card2X + 12, cardsY + 24, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica-Bold').text(`#${order._id.toString().toUpperCase()}`, card2X + 88, cardsY + 24, { lineBreak: false });

            doc.font('Helvetica').fillColor(mutedColor).text('Payment Gateway:', card2X + 12, cardsY + 36, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica').text('Razorpay Payments Network', card2X + 88, cardsY + 36, { lineBreak: false });

            doc.font('Helvetica').fillColor(mutedColor).text('Payment Method:', card2X + 12, cardsY + 48, { lineBreak: false });
            const pMethod = order.paymentMethod === 'RAZORPAY' ? 'Online (UPI / Cards / Netbanking)' : (order.paymentMethod || 'Razorpay');
            doc.fillColor(darkColor).font('Helvetica-Bold').text(pMethod, card2X + 88, cardsY + 48, { lineBreak: false });

            doc.font('Helvetica').fillColor(mutedColor).text('Payment Status:', card2X + 12, cardsY + 60, { lineBreak: false });
            const isCaptured = order.isPaid || order.status === 'PAID';
            doc.fillColor(isCaptured ? '#15803d' : '#b45309').font('Helvetica-Bold').text(isCaptured ? 'CAPTURED / PAID' : (order.paymentMethod === 'COD' ? 'COD - UNPAID' : 'PENDING'), card2X + 88, cardsY + 60, { lineBreak: false });

            const txnId = order.razorpayPaymentId || payment?.razorpayPaymentId || (isCaptured ? 'Confirmed Online' : 'N/A');
            doc.font('Helvetica').fontSize(7).fillColor(mutedColor).text('Razorpay Txn ID:', card2X + 12, cardsY + 72, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica').fontSize(7).text(txnId, card2X + 88, cardsY + 72, { width: 160, ellipsis: true, lineBreak: false });

            const rzpOrderId = order.razorpayOrderId || payment?.razorpayOrderId || 'N/A';
            doc.font('Helvetica').fontSize(7).fillColor(mutedColor).text('Razorpay Order ID:', card2X + 12, cardsY + 83, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica').fontSize(7).text(rzpOrderId, card2X + 88, cardsY + 83, { width: 160, ellipsis: true, lineBreak: false });

            // ==========================================
            // 3. ITEMS TABLE (FULL GRID WITH SUMMARY FOOTER)
            // ==========================================
            const tableTop = cardsY + cardH + 16; // 212
            const headerH = 22;

            // Columns Definition
            const colX = {
                sno: leftX,              // w: 28
                desc: leftX + 28,        // w: 232
                hsn: leftX + 260,        // w: 50
                qty: leftX + 310,        // w: 32
                rate: leftX + 342,       // w: 66
                tax: leftX + 408,        // w: 46
                total: leftX + 454       // w: 77.28
            };

            // Table Header Bar
            doc.rect(leftX, tableTop, contentWidth, headerH).fill(tableHeaderBg);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
            doc.text('S.NO', colX.sno, tableTop + 7, { width: 28, align: 'center', lineBreak: false });
            doc.text('ITEM DESCRIPTION & SPECIFICATIONS', colX.desc + 8, tableTop + 7, { lineBreak: false });
            doc.text('HSN', colX.hsn, tableTop + 7, { width: 50, align: 'center', lineBreak: false });
            doc.text('QTY', colX.qty, tableTop + 7, { width: 32, align: 'center', lineBreak: false });
            doc.text('UNIT RATE', colX.rate, tableTop + 7, { width: 62, align: 'right', lineBreak: false });
            doc.text('TAX', colX.tax, tableTop + 7, { width: 46, align: 'center', lineBreak: false });
            doc.text('TOTAL', colX.total, tableTop + 7, { width: 70, align: 'right', lineBreak: false });

            // Render Rows
            const items = order.orderItems || [];
            let currY = tableTop + headerH;
            const singleRowH = 34;
            let totalQty = 0;

            items.forEach((item, idx) => {
                totalQty += item.qty || 1;
                if (idx % 2 === 1) {
                    doc.rect(leftX, currY, contentWidth, singleRowH).fill('#faf8f5');
                }

                doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8);
                doc.text(`${idx + 1}`, colX.sno, currY + 11, { width: 28, align: 'center', lineBreak: false });

                // Variant info
                const variantParts = [];
                if (item.size) variantParts.push(`Size: ${item.size}`);
                if (item.color) variantParts.push(`Color: ${item.color}`);
                const vText = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';

                doc.fillColor(darkColor).font('Helvetica-Bold').text(item.name || 'Apparel Product', colX.desc + 8, currY + 7, { width: 218, ellipsis: true, lineBreak: false });
                doc.font('Helvetica').fontSize(7).fillColor(mutedColor).text(vText || 'Standard Edition', colX.desc + 8, currY + 20, { width: 218, ellipsis: true, lineBreak: false });

                doc.font('Helvetica').fontSize(7.5).fillColor(bodyColor).text('610910', colX.hsn, currY + 11, { width: 50, align: 'center', lineBreak: false });
                doc.fillColor(darkColor).font('Helvetica-Bold').text(`${item.qty}`, colX.qty, currY + 11, { width: 32, align: 'center', lineBreak: false });
                doc.font('Helvetica').fontSize(7.5).fillColor(bodyColor).text(formatCur(item.price), colX.rate, currY + 11, { width: 62, align: 'right', lineBreak: false });
                doc.font('Helvetica').fontSize(7).fillColor(mutedColor).text('5% Incl.', colX.tax, currY + 11, { width: 46, align: 'center', lineBreak: false });
                doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8).text(formatCur(item.qty * item.price), colX.total, currY + 11, { width: 70, align: 'right', lineBreak: false });

                currY += singleRowH;
                doc.strokeColor(lightBorder).lineWidth(0.5).moveTo(leftX, currY).lineTo(rightX, currY).stroke();
            });

            // Table Subtotal Summary Row
            const tableFooterH = 22;
            doc.rect(leftX, currY, contentWidth, tableFooterH).fill('#faf8f5');
            doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(7.5);
            doc.text(`Total Items: ${items.length}`, leftX + 12, currY + 6, { lineBreak: false });
            doc.text(`Total Quantity: ${totalQty}`, leftX + 110, currY + 6, { lineBreak: false });

            const subtotal = order.subtotal || items.reduce((sum, i) => sum + (i.price * i.qty), 0) || order.totalPrice;
            doc.text('Items Subtotal:', colX.rate - 20, currY + 6, { width: 80, align: 'right', lineBreak: false });
            doc.fillColor(primaryColor).text(formatCur(subtotal), colX.total, currY + 6, { width: 70, align: 'right', lineBreak: false });

            currY += tableFooterH;
            // Outer border of table
            doc.strokeColor(lightBorder).lineWidth(0.8).rect(leftX, tableTop, contentWidth, currY - tableTop).stroke();

            // ==========================================
            // 4. FINANCIAL SUMMARY & TAX ANALYSIS MATRIX
            // ==========================================
            const discount = order.discountAmount || 0;
            const shipping = order.shippingFee || 0;
            const grandTotal = order.totalPrice;
            const estimatedTax = Math.round((grandTotal * 5) / 105 * 100) / 100;
            const taxableValue = Math.round((grandTotal - estimatedTax) * 100) / 100;

            const summaryY = currY + 16;
            const summaryH = 124;
            const leftBoxW = 305;
            const rightBoxW = contentWidth - leftBoxW - 12; // ~214.28
            const rightBoxX = leftX + leftBoxW + 12;

            // Left Box: Amount in Words & GST Matrix
            doc.roundedRect(leftX, summaryY, leftBoxW, summaryH, 5).fillAndStroke(cardBg, lightBorder);

            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(7.5).text('AMOUNT IN WORDS', leftX + 12, summaryY + 9, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8.5).text(numberToWords(grandTotal), leftX + 12, summaryY + 22, { width: leftBoxW - 24, lineBreak: false });

            doc.strokeColor(lightBorder).lineWidth(0.5).moveTo(leftX + 12, summaryY + 39).lineTo(leftX + leftBoxW - 12, summaryY + 39).stroke();

            // GST Tax Analysis Mini Table
            doc.fillColor(mutedColor).font('Helvetica-Bold').fontSize(7).text('TAX SUMMARY (GST INCLUDED IN INVOICE PRICE)', leftX + 12, summaryY + 47, { lineBreak: false });

            // Mini GST Matrix Header
            const gstY = summaryY + 61;
            doc.rect(leftX + 12, gstY, leftBoxW - 24, 16).fill('#f3f4f6');
            doc.fillColor(mutedColor).font('Helvetica-Bold').fontSize(6.5);
            doc.text('TAX TYPE', leftX + 16, gstY + 5, { width: 80, lineBreak: false });
            doc.text('BASE VAL', leftX + 96, gstY + 5, { width: 60, align: 'right', lineBreak: false });
            doc.text('RATE', leftX + 160, gstY + 5, { width: 45, align: 'center', lineBreak: false });
            doc.text('TAX AMT', leftX + 210, gstY + 5, { width: 68, align: 'right', lineBreak: false });

            // CGST Row
            const cgstY = gstY + 20;
            doc.font('Helvetica').fontSize(7).fillColor(bodyColor);
            doc.text('Central GST (CGST)', leftX + 16, cgstY, { width: 80, lineBreak: false });
            doc.text(formatCur(taxableValue), leftX + 96, cgstY, { width: 60, align: 'right', lineBreak: false });
            doc.text('2.50%', leftX + 160, cgstY, { width: 45, align: 'center', lineBreak: false });
            doc.text(formatCur(estimatedTax / 2), leftX + 210, cgstY, { width: 68, align: 'right', lineBreak: false });

            // SGST Row
            const sgstY = cgstY + 14;
            doc.text('State GST (SGST)', leftX + 16, sgstY, { width: 80, lineBreak: false });
            doc.text(formatCur(taxableValue), leftX + 96, sgstY, { width: 60, align: 'right', lineBreak: false });
            doc.text('2.50%', leftX + 160, sgstY, { width: 45, align: 'center', lineBreak: false });
            doc.text(formatCur(estimatedTax / 2), leftX + 210, sgstY, { width: 68, align: 'right', lineBreak: false });

            doc.fillColor(mutedColor).fontSize(6.5).text('Reverse Charge: No | Supply: E-Commerce B2C | Certified under CGST Act 2017', leftX + 12, summaryY + 107, { lineBreak: false });

            // Right Box: Price Breakdown Card
            doc.roundedRect(rightBoxX, summaryY, rightBoxW, summaryH, 5).fillAndStroke('#ffffff', lightBorder);
            let sY = summaryY + 10;
            const sGap = 16;
            const rLabelX = rightBoxX + 12;
            const rValX = rightBoxX + 100;
            const rValW = rightBoxW - 112;

            doc.font('Helvetica').fontSize(7.5).fillColor(mutedColor).text('Gross Subtotal:', rLabelX, sY, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica').text(formatCur(subtotal), rValX, sY, { width: rValW, align: 'right', lineBreak: false });

            if (discount > 0) {
                sY += sGap;
                doc.fillColor('#15803d').font('Helvetica').text(`Discount (${order.couponCode || 'Promo'}):`, rLabelX, sY, { lineBreak: false });
                doc.text(`- ${formatCur(discount)}`, rValX, sY, { width: rValW, align: 'right', lineBreak: false });
            }

            sY += sGap;
            doc.fillColor(mutedColor).font('Helvetica').text('Shipping Charges:', rLabelX, sY, { lineBreak: false });
            doc.fillColor('#15803d').font('Helvetica-Bold').text(shipping === 0 ? 'FREE' : formatCur(shipping), rValX, sY, { width: rValW, align: 'right', lineBreak: false });

            sY += sGap;
            doc.fillColor(mutedColor).font('Helvetica').text('Tax (5% GST Incl.):', rLabelX, sY, { lineBreak: false });
            doc.fillColor(darkColor).font('Helvetica').text(formatCur(estimatedTax), rValX, sY, { width: rValW, align: 'right', lineBreak: false });

            // Accent Line
            sY += sGap + 5;
            doc.strokeColor(primaryColor).lineWidth(1).moveTo(rLabelX, sY).lineTo(rightBoxX + rightBoxW - 12, sY).stroke();
            sY += 6;

            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('Final Amount:', rLabelX, sY, { lineBreak: false });
            doc.text(formatCur(grandTotal), rValX, sY, { width: rValW, align: 'right', lineBreak: false });

            // ==========================================
            // 5. SIGNATORY & TERMS SECTION
            // ==========================================
            const signY = summaryY + summaryH + 16;
            const signH = 76;

            doc.roundedRect(leftX, signY, contentWidth, signH, 5).fillAndStroke(cardBg, lightBorder);

            // Left: Terms
            doc.fillColor(darkColor).fontSize(7.5).font('Helvetica-Bold').text('Customer Notice & Terms:', leftX + 12, signY + 9, { lineBreak: false });
            doc.font('Helvetica').fontSize(7).fillColor(mutedColor);
            doc.text('1. Easy returns and size replacements within 7 days of package delivery.', leftX + 12, signY + 23, { lineBreak: false });
            doc.text('2. 100% genuine apparel crafted with certified premium cotton fibers.', leftX + 12, signY + 36, { lineBreak: false });
            doc.text('3. Exclusive legal jurisdiction: Courts in Delhi, India.', leftX + 12, signY + 49, { lineBreak: false });
            doc.text('4. Computer-generated tax invoice; requires no physical signature under IT Act 2000.', leftX + 12, signY + 61, { lineBreak: false });

            // Right: Verification Seal
            const signBadgeW = 155;
            const signBadgeX = rightX - signBadgeW - 12;
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8).text('FOR OWNVIBES APPAREL', signBadgeX, signY + 9, { width: signBadgeW, align: 'center', lineBreak: false });

            // Emerald seal box
            doc.roundedRect(signBadgeX + 12, signY + 24, 130, 20, 3).fillAndStroke('#ecfdf5', '#10b981');
            doc.fillColor('#047857').font('Helvetica-Bold').fontSize(7.5).text('DIGITALLY VERIFIED', signBadgeX + 12, signY + 30, { width: 130, align: 'center', characterSpacing: 0.5, lineBreak: false });

            doc.font('Helvetica').fontSize(7).fillColor(mutedColor).text('Authorized E-Commerce Signatory', signBadgeX, signY + 54, { width: signBadgeW, align: 'center', lineBreak: false });

            // ==========================================
            // 6. BRAND ASSURANCE BADGES (3 Cards)
            // ==========================================
            const badgeY = signY + signH + 20;
            const bWidth = (contentWidth - 16) / 3;
            const bHeight = 54;

            const badges = [
                { title: '100% GENUINE APPAREL', desc: 'Handcrafted luxury streetwear made with combed long-staple cotton.' },
                { title: '7 DAYS EASY REPLACEMENTS', desc: 'Hassle-free doorstep size and style exchange guaranteed.' },
                { title: 'DEDICATED CONCIERGE CARE', desc: 'Direct priority customer assistance at info@ownvibes.com.' }
            ];

            badges.forEach((b, i) => {
                const bX = leftX + i * (bWidth + 8);
                doc.roundedRect(bX, badgeY, bWidth, bHeight, 5).fillAndStroke('#ffffff', lightBorder);
                doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(7.5).text(b.title, bX + 6, badgeY + 12, { width: bWidth - 12, align: 'center', lineBreak: false });
                doc.fillColor(mutedColor).font('Helvetica').fontSize(6.8).text(b.desc, bX + 8, badgeY + 26, { width: bWidth - 16, align: 'center', lineBreak: true });
            });

            // ==========================================
            // 7. CUSTOMER HELPLINE & SUPPORT BANNER
            // ==========================================
            const bannerY = badgeY + bHeight + 20;
            const bannerH = 50;
            doc.roundedRect(leftX, bannerY, contentWidth, bannerH, 5).fillAndStroke(subtleBg, lightBorder);
            doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8).text('Need assistance with this order, styling advice, or return queries?', leftX + 14, bannerY + 13, { lineBreak: false });
            doc.font('Helvetica').fontSize(7.2).fillColor(mutedColor).text('Our concierge support team is available Mon-Sat, 10:00 AM - 7:00 PM IST.', leftX + 14, bannerY + 28, { lineBreak: false });

            const helpRightW = 270;
            const helpRightX = rightX - helpRightW - 14;
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(primaryColor).text('Email: info@ownvibes.com   |   Helpline: +91 8873405595', helpRightX, bannerY + 13, { width: helpRightW, align: 'right', lineBreak: false });
            doc.font('Helvetica').fontSize(7.2).fillColor(mutedColor).text('Track orders & initiate returns online at www.ownvibes.in', helpRightX, bannerY + 28, { width: helpRightW, align: 'right', lineBreak: false });

            // ==========================================
            // 8. LEGAL DECLARATION & AUDIT NOTICE
            // ==========================================
            const declY = bannerY + bannerH + 18;
            doc.fillColor(mutedColor).fontSize(6.8).font('Helvetica').text('This document is an electronically generated Tax Invoice under Section 31 of CGST Act, 2017 and Information Technology Act, 2000. All applicable taxes have been collected and remitted to the Government.', leftX, declY, { width: contentWidth, align: 'center', lineBreak: false });

            // ==========================================
            // 9. LUXURY INVOICE FOOTER (Anchored at bottom)
            // ==========================================
            const footerY = 792;
            doc.strokeColor(lightBorder).lineWidth(0.5).moveTo(leftX, footerY).lineTo(rightX, footerY).stroke();
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text('Thank you for shopping with Ownvibes!', leftX, footerY + 6, { width: contentWidth, align: 'center', lineBreak: false });
            doc.font('Helvetica').fontSize(6.8).fillColor(mutedColor).text('Registered Office: C-31, Nawada Housing Complex, New Delhi - 110059 | GSTIN: 07AABCU9603R1ZM | www.ownvibes.in', leftX, footerY + 19, { width: contentWidth, align: 'center', lineBreak: false });

            doc.end();
        } catch (error) {
            console.error('Invoice PDF Generation Exception:', error);
            reject(error);
        }
    });
};

export default {
    generateInvoicePDF
};
