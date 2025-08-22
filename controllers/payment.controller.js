// import Coupon from "../models/coupon.model.js";
// import Order from "../models/order.model.js";
// import { stripe } from "../lib/stripe.js";
// import { sendOrderConfirmationEmail } from "../lib/mailer.js"
// import { sendAdminNotificationEmail, sendOrderConfirmationEmail } from "../lib/mailer.js"
// import User from "../models/user.model.js";

// export const createCheckoutSession = async (req, res) => {
// 	try {
// 		const { products, couponCode } = req.body;

// 		if (!Array.isArray(products) || products.length === 0) {
// 			return res.status(400).json({ error: "Invalid or empty products array" });
// 		}

// 		let totalAmount = 0;

// 		const lineItems = products.map((product) => {
// 			const amount = Math.round(product.price * 100); 
// 			totalAmount += amount * product.quantity;

// 			return {
// 				price_data: {
// 					currency: "usd",
// 					product_data: {
// 						name: product.name,
// 						images: [product.image],
// 					},
// 					unit_amount: amount,
// 				},
// 				quantity: product.quantity || 1,
// 			};
// 		});

// 		let coupon = null;
// 		if (couponCode) {
// 			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
// 			if (coupon) {
// 				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
// 			}
// 		}

// 		const session = await stripe.checkout.sessions.create({
// 			payment_method_types: ["card"],
// 			line_items: lineItems,
// 			mode: "payment",
// 			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
// 			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
// 			discounts: coupon
// 				? [
// 						{
// 							coupon: await createStripeCoupon(coupon.discountPercentage),
// 						},
// 				  ]
// 				: [],
// 			metadata: {
// 				userId: req.user._id.toString(),
// 				couponCode: couponCode || "",
// 				products: JSON.stringify(
// 					products.map((p) => ({
// 						id: p._id,
// 						quantity: p.quantity,
// 						price: p.price,
// 					}))
// 				),
// 			},
// 		});

// 		if (totalAmount >= 20000) {
// 			await createNewCoupon(req.user._id);
// 		}
// 		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
// 	} catch (error) {
// 		console.error("Error processing checkout:", error);
// 		res.status(500).json({ message: "Error processing checkout", error: error.message });
// 	}
// };

// // export const checkoutSuccess = async (req, res) => {
// // 	try {
// // 		const { sessionId } = req.body;
// // 		const session = await stripe.checkout.sessions.retrieve(sessionId);

// // 		if (session.payment_status === "paid") {
// // 			if (session.metadata.couponCode) {
// // 				await Coupon.findOneAndUpdate(
// // 					{
// // 						code: session.metadata.couponCode,
// // 						userId: session.metadata.userId,
// // 					},
// // 					{
// // 						isActive: false,
// // 					}
// // 				);
// // 			}

// // 			// create a new Order
// // 			const products = JSON.parse(session.metadata.products);
// // 			const newOrder = new Order({
// // 				user: session.metadata.userId,
// // 				products: products.map((product) => ({
// // 					product: product.id,
// // 					quantity: product.quantity,
// // 					price: product.price,
// // 				})),
// // 				totalAmount: session.amount_total / 100, // convert from cents to dollars,
// // 				stripeSessionId: sessionId,
// // 			});

// // 			await newOrder.save();

// // 			res.status(200).json({
// // 				success: true,
// // 				message: "Payment successful, order created, and coupon deactivated if used.",
// // 				orderId: newOrder._id,
// // 			});
// // 		}
// // 	} catch (error) {
// // 		console.error("Error processing successful checkout:", error);
// // 		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
// // 	}
// // };


// // export const checkoutSuccess = async (req, res) => {
// // 	try {
// // 	  const { sessionId } = req.body;
// // 	  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
// // 	  if (session.payment_status === "paid") {
// // 		if (session.metadata.couponCode) {
// // 		  await Coupon.findOneAndUpdate(
// // 			{
// // 			  code: session.metadata.couponCode,
// // 			  userId: session.metadata.userId,
// // 			},
// // 			{
// // 			  isActive: false,
// // 			}
// // 		  );
// // 		}
  
// // 		const products = JSON.parse(session.metadata.products);
// // 		const newOrder = new Order({
// // 		  user: session.metadata.userId,
// // 		  products: products.map((product) => ({
// // 			product: product.id,
// // 			quantity: product.quantity,
// // 			price: product.price,
// // 		  })),
// // 		  totalAmount: session.amount_total / 100,
// // 		  stripeSessionId: sessionId,
// // 		});
  
// // 		await newOrder.save();
  
// // 		// ✅ Fetch user's email
// // 		const user = await User.findById(session.metadata.userId);
// // 		if (user && user.email) {
// // 		  await sendOrderConfirmationEmail(user.email, newOrder._id);
// // 		}
  
// // 		res.status(200).json({
// // 		  success: true,
// // 		  message: "Payment successful, order created, and email sent.",
// // 		  orderId: newOrder._id,
// // 		});
// // 	  }
// // 	} catch (error) {
// // 	  console.error("Error processing checkout success:", error.message);
// // 	  res.status(500).json({ message: "Checkout success failed", error: error.message });
// // 	}
// //   };

// // export const checkoutSuccess = async (req, res) => {
// // 	try {
// // 		const { sessionId } = req.body;
// // 		const session = await stripe.checkout.sessions.retrieve(sessionId);

// // 		if (session.payment_status === "paid") {
// // 			//  Check if order already exists
// // 			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
// // 			if (existingOrder) {
// // 				return res.status(200).json({
// // 					success: true,
// // 					message: "Order already exists for this session.",
// // 					orderId: existingOrder._id,
// // 				});
// // 			}

// // 			// Deactivate coupon if used
// // 			if (session.metadata.couponCode) {
// // 				await Coupon.findOneAndUpdate(
// // 					{ code: session.metadata.couponCode, userId: session.metadata.userId },
// // 					{ isActive: false }
// // 				);
// // 			}

// // 			// Create new order
// // 			const products = JSON.parse(session.metadata.products);
// // 			const newOrder = new Order({
// // 				user: session.metadata.userId,
// // 				products: products.map((product) => ({
// // 					product: product.id,
// // 					quantity: product.quantity,
// // 					price: product.price,
// // 				})),
// // 				totalAmount: session.amount_total / 100,
// // 				stripeSessionId: sessionId,
// // 			});

// // 			await newOrder.save();

// // 			//  Send confirmation email
// // 			const user = await User.findById(session.metadata.userId);
// // 			if (user && user.email) {
// // 				await sendOrderConfirmationEmail(user.email, newOrder._id);
// // 			}

// // 			res.status(200).json({
// // 				success: true,
// // 				message: "Payment successful, order created, and email sent.",
// // 				orderId: newOrder._id,
// // 			});
// // 		}
// // 	} catch (error) {
// // 		console.error("Error processing checkout success:", error.message);
// // 		res.status(500).json({ message: "Checkout success failed", error: error.message });
// // 	}
// // };


// export const checkoutSuccess = async (req, res) => {
// 	try {
// 		const { sessionId } = req.body;
// 		const session = await stripe.checkout.sessions.retrieve(sessionId);

// 		if (session.payment_status === "paid") {
// 			//  Check if order already exists

// 			// Check if order already exists

// 			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
// 			if (existingOrder) {
// 				return res.status(200).json({
// 					success: true,
// 					message: "Order already exists for this session.",
// 					orderId: existingOrder._id,
// 				});
// 			}


// 			// Deactivate coupon if used
// 			// Deactivate used coupon

// 			if (session.metadata.couponCode) {
// 				await Coupon.findOneAndUpdate(
// 					{ code: session.metadata.couponCode, userId: session.metadata.userId },
// 					{ isActive: false }
// 				);
// 			}

// 			// Create new order

// 			// Create order

// 			const products = JSON.parse(session.metadata.products);
// 			const newOrder = new Order({
// 				user: session.metadata.userId,
// 				products: products.map((product) => ({
// 					product: product.id,
// 					quantity: product.quantity,
// 					price: product.price,
// 				})),
// 				totalAmount: session.amount_total / 100,
// 				stripeSessionId: sessionId,
// 			});

// 			await newOrder.save();

// 			//  Send confirmation email
// 			const user = await User.findById(session.metadata.userId);

// 			// Fetch user
// 			const user = await User.findById(session.metadata.userId);

// 			// Send user confirmation email
//             (update Admin)
// 			if (user && user.email) {
// 				await sendOrderConfirmationEmail(user.email, newOrder._id);
// 			}

// 			res.status(200).json({
// 				success: true,
// 				message: "Payment successful, order created, and email sent.",

// 			// Send admin notification email
// 			if (process.env.ADMIN_EMAIL) {
// 				await sendAdminNotificationEmail(process.env.ADMIN_EMAIL, newOrder, user);
// 			}

// 			res.status(200).json({
// 				success: true,
// 				message: "Order created and both emails sent.",
// (update Admin)
// 				orderId: newOrder._id,
// 			});
// 		}
// 	} catch (error) {
// <<<<<<< HEAD
// 		console.error("Error processing checkout success:", error.message);
// =======
// 		console.error("Checkout success error:", error.message);
// >>>>>>> 73f8523 (update Admin)
// 		res.status(500).json({ message: "Checkout success failed", error: error.message });
// 	}
// };

// <<<<<<< HEAD
// =======

// >>>>>>> 73f8523 (update Admin)
// async function createStripeCoupon(discountPercentage) {
// 	const coupon = await stripe.coupons.create({
// 		percent_off: discountPercentage,
// 		duration: "once",
// 	});

// 	return coupon.id;
// }

// async function createNewCoupon(userId) {
// 	await Coupon.findOneAndDelete({ userId });

// 	const newCoupon = new Coupon({
// 		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
// 		discountPercentage: 10,
// 		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
// 		userId: userId,
// 	});

// 	await newCoupon.save();

// 	return newCoupon;
// <<<<<<< HEAD
// }
// =======
// }

// export const placeOrder = async (req, res) => {
// 	const { cartItems, totalAmount } = req.body;
// 	const userId = req.user._id;

// 	// Save order to DB
// 	const order = await Order.create({
// 		user: userId,
// 		items: cartItems,
// 		total: totalAmount,
// 	});

// 	// 1. Send email to the customer
// 	await sendEmail({
// 		to: req.user.email,
// 		subject: "Your Order Confirmation",
// 		text: "Thank you for your order!",
// 	});

// 	// ✅ 2. Send email to the admin
// 	await sendEmail({
// 		to: process.env.ADMIN_EMAIL, // store this in .env
// 		subject: "New Order Received",
// 		text: `A new order has been placed by ${req.user.name} (email: ${req.user.email}).`,
// 	});

// 	res.status(201).json({ message: "Order placed successfully", order });
// };
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from "../lib/mailer.js";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); 
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			//  Check if order already exists
			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				return res.status(200).json({
					success: true,
					message: "Order already exists for this session.",
					orderId: existingOrder._id,
				});
			}

			// Deactivate coupon if used
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{ code: session.metadata.couponCode, userId: session.metadata.userId },
					{ isActive: false }
				);
			}

			// Create new order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			//  Send confirmation email
			const user = await User.findById(session.metadata.userId);

			// Fetch user again (duplicate kept as per your structure)
			const userAgain = await User.findById(session.metadata.userId);

			// Send user confirmation email
			if (user && user.email) {
				await sendOrderConfirmationEmail(user.email, newOrder._id);
			}

			// Send admin notification email
			if (process.env.ADMIN_EMAIL) {
				await sendAdminNotificationEmail(process.env.ADMIN_EMAIL, newOrder, user);
			}

			res.status(200).json({
				success: true,
				message: "Order created and both emails sent.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing checkout success:", error.message);
		res.status(500).json({ message: "Checkout success failed", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});
	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}

export const placeOrder = async (req, res) => {
	const { cartItems, totalAmount } = req.body;
	const userId = req.user._id;

	// Save order to DB
	const order = await Order.create({
		user: userId,
		items: cartItems,
		total: totalAmount,
	});

	// 1. Send email to the customer
	await sendEmail({
		to: req.user.email,
		subject: "Your Order Confirmation",
		text: "Thank you for your order!",
	});

	// 2. Send email to the admin
	await sendEmail({
		to: process.env.ADMIN_EMAIL,
		subject: "New Order Received",
		text: `A new order has been placed by ${req.user.name} (email: ${req.user.email}).`,
	});

	res.status(201).json({ message: "Order placed successfully", order });
};

