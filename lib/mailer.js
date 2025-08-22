import nodemailer from "nodemailer";

export const sendOrderConfirmationEmail = async (to, orderId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"EcoHub" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your EcoHub Order Confirmation",
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
        <p>Expected delivery: <strong>2-3 business days</strong>.</p>
        <p>We appreciate your trust in us </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent to", to);
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
};



// ✅ NEW: Admin notification email
export const sendAdminNotificationEmail = async (adminEmail, order, user) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const productSummary = order.products
		.map((p) => `- ${p.quantity} x ${p.product} @ $${p.price}`)
		.join("\n");

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: adminEmail,
		subject: " New Order Received",
		text: `
Hello Admin,

A new order has been placed.

 Customer: ${user?.name || "N/A"} (${user?.email})
 Amount: $${order.totalAmount}
 Products:
${productSummary}

Time: ${new Date().toLocaleString()}

Regards,
EcoHub
		`,
	};

	await transporter.sendMail(mailOptions);
};

