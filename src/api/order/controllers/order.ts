/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;

      // Set the date to current time
      data.date = new Date();

      // Create the order
      const order = await super.create(ctx);

      // Create Stripe checkout session
      const stripeSession = await strapi
        .service("api::order.stripe")
        .createPaymentSession(order.data);

      // Return both the order and the Stripe session URL
      return {
        order: order.data,
        stripeUrl: stripeSession.url,
      };
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
  })
);
