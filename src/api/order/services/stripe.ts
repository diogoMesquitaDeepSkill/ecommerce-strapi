import { factories } from "@strapi/strapi";
import Stripe from "stripe";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    async createPaymentSession(order) {
      const stripe = new Stripe(strapi.config.get("stripe.secretKey"), {
        apiVersion: "2025-05-28.basil" as const,
      });

      const lineItems = await Promise.all(
        order.products.map(async (productId) => {
          const product = await strapi.entityService.findOne(
            "api::product.product",
            productId
          );
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: Math.round(product.price * 100), // Stripe expects amounts in cents
            },
            quantity: 1,
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/order/canceled`,
        customer_email: order.email,
        metadata: {
          orderId: order.id.toString(),
        },
      });

      return session;
    },

    async handleStripeWebhook(requestBody, signature) {
      const stripe = new Stripe(strapi.config.get("stripe.secretKey"), {
        apiVersion: "2025-05-28.basil" as const,
      });

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          requestBody,
          signature,
          strapi.config.get("stripe.webhookSecret")
        );
      } catch (err) {
        throw new Error(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Update the order
        await strapi.documents("api::order.order").update({
          documentId: session.metadata.orderId,
          data: {
            standing: "paid",
            stripeId: session.id,
          },
        });
      }

      return { received: true };
    },
  })
);
