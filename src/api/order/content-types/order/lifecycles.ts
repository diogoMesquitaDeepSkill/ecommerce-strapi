export default {
  async afterUpdate(event) {
    const { result, params } = event;

    // Check if the standing field was updated
    if (params.data && params.data.standing) {
      const newStanding = params.data.standing;

      // Get the full order with populated data for email
      const order = await strapi.documents("api::order.order").findOne({
        documentId: result.documentId,
        populate: {
          orderItems: {
            populate: {
              product: true,
            },
          },
          address: true,
        },
      });

      // Safety check: ensure order exists and has required data
      if (!order) {
        console.error("Order not found for email sending:", result.id);
        return;
      }

      if (!order.orderItems || order.orderItems.length === 0) {
        console.error("Order has no orderItems:", order.id);
        return;
      }

      if (!order.address) {
        console.error("Order has no address:", order.id);
        return;
      }

      if (newStanding === "paid") {
        console.log("Sending order confirmation email for order:", order.id);
        // Send order confirmation email when payment is confirmed
        try {
          await strapi
            .service("api::order.email")
            .sendOrderConfirmationEmail(order);
        } catch (error) {
          console.error("Failed to send order confirmation email:", error);
        }
      } else if (newStanding === "shipped") {
        console.log("Sending order shipped email for order:", order.id);
        // Send shipping notification email
        try {
          await strapi.service("api::order.email").sendOrderShippedEmail(order);
        } catch (error) {
          console.error("Failed to send order shipped email:", error);
        }
      }
    }
  },
};
