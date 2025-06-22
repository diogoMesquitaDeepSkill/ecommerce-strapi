import { factories } from "@strapi/strapi";
import Stripe from "stripe";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    async createPaymentSession(order) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-05-28.basil" as const,
        });

        const lineItems = order.orderItems.map((item) => {
          const product = item.product;
          // Convert richtext description to plain text (remove markdown/HTML tags)
          let description = "";
          if (product.description && typeof product.description === "string") {
            // Remove markdown formatting and HTML tags
            description = product.description
              .replace(/#{1,6}\s+/g, "") // Remove headers
              .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
              .replace(/\*(.*?)\*/g, "$1") // Remove italic
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
              .replace(/<[^>]*>/g, "") // Remove HTML tags
              .replace(/\n+/g, " ") // Replace newlines with spaces
              .trim();
          }

          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: product.name || "Product",
                description: description || "No description available",
              },
              unit_amount: Math.round(
                parseFloat(product.price.toString()) * 100
              ), // Stripe expects amounts in cents
            },
            quantity: item.quantity || 1,
          };
        });

        // Get locale from the first product (assuming all products have the same locale)
        const locale = order.orderItems[0]?.product?.locale || "pt";

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          locale: locale, // Set Stripe checkout locale
          success_url: `${process.env.FRONTEND_URL}/${locale}/order/access-token/${order.accessToken}`,
          cancel_url: `${process.env.FRONTEND_URL}/${locale}/order/canceled/${order.accessToken}`,
          customer_email: order.email,
          metadata: {
            orderId: order.id.toString(),
            accessToken: order.accessToken,
            locale: locale,
          },
        });

        return session;
      } catch (error) {
        console.error("Error creating Stripe session:", error);
        throw new Error(`Failed to create payment session: ${error.message}`);
      }
    },

    async handleStripeWebhook(requestBody, signature) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-05-28.basil" as const,
      });

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          requestBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        throw new Error(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Update the order using accessToken for better security
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
