/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;

      try {
        // Calculate total price from orderItems
        let totalPrice = 0;
        if (data.orderItems && data.orderItems.length > 0) {
          for (const item of data.orderItems) {
            const product = await strapi
              .documents("api::product.product")
              .findOne({
                documentId: item.product.toString(),
              });
            if (product && product.price) {
              totalPrice +=
                parseFloat(product.price.toString()) * (item.quantity || 1);
            }
          }
        }

        // Generate unique access token (using timestamp + random string)
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const accessToken = `order_${timestamp}_${randomString}`;

        // Prepare order data
        const orderData = {
          name: data.name,
          email: data.email,
          orderItems: data.orderItems,
          shippingMethod: data.shippingMethod,
          address: data.address,
          phoneNumber: data.phoneNumber, // optional
          totalPrice: totalPrice,
          date: new Date(),
          accessToken: accessToken,
          standing: "unpaid" as const, // default value with proper type
        };

        // Create the order using strapi.documents
        const order = await strapi.documents("api::order.order").create({
          data: orderData,
          populate: ["orderItems.product"],
        });

        // Create Stripe checkout session
        const stripeSession = await strapi
          .service("api::order.stripe")
          .createPaymentSession(order);

        // Update the order with the Stripe session ID
        await strapi.documents("api::order.order").update({
          documentId: order.documentId.toString(),
          data: {
            stripeId: stripeSession.id,
          },
        });

        // Return both the order and the Stripe session URL
        return {
          order: order,
          stripeUrl: stripeSession.url,
        };
      } catch (error) {
        console.error("Error creating order:", error);
        ctx.throw(400, error.message);
      }
    },

    async findByToken(ctx) {
      try {
        const { token } = ctx.params;

        const orders = await strapi.documents("api::order.order").findMany({
          filters: { accessToken: token },
          populate: {
            orderItems: {
              populate: {
                product: true,
              },
            },
            address: true,
          },
        });

        if (!orders || orders.length === 0) {
          ctx.throw(404, "Order not found");
        }

        const order = orders[0];

        return { order: order };
      } catch (error) {
        console.error("Error finding order by token:", error);
        ctx.throw(400, error.message);
      }
    },

    async webhook(ctx) {
      try {
        // Get the signature from the headers
        const signature = ctx.request.headers["stripe-signature"];

        // Handle the webhook
        const result = await strapi
          .service("api::order.stripe")
          .handleStripeWebhook(ctx.request.body, signature);

        return result;
      } catch (err) {
        ctx.throw(400, err.message);
      }
    },

    async testEmail(ctx) {
      try {
        console.log("Testing email service...");

        // Test if email service is available
        if (!strapi.plugins.email.services.email) {
          throw new Error("Email service not available");
        }

        // Test basic email sending
        await strapi.plugins.email.services.email.send({
          to: "test@example.com",
          subject: "Test Email",
          html: "<h1>Test Email</h1><p>This is a test email from Strapi.</p>",
        });

        return { success: true, message: "Test email sent successfully" };
      } catch (error) {
        console.error("Email test failed:", error);
        return {
          success: false,
          error: error.message,
          stack: error.stack,
        };
      }
    },
  })
);
