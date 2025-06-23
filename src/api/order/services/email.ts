import { factories } from "@strapi/strapi";
import { getEmailTemplates } from "./email-templates";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    async sendOrderConfirmationEmail(order) {
      console.log("sendOrderConfirmationEmail...");
      try {
        // Safety checks
        if (!order) {
          throw new Error("Order is null or undefined");
        }

        if (!order.orderItems || order.orderItems.length === 0) {
          throw new Error("Order has no orderItems");
        }

        if (!order.address) {
          throw new Error("Order has no address");
        }

        if (!order.email) {
          throw new Error("Order has no email address");
        }

        // Get locale from the first product
        const locale = order.orderItems[0]?.product?.locale || "pt";

        // Get email templates based on locale
        const templates = getEmailTemplates(locale);

        // Get website URL
        const websiteUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const contactUrl = `${websiteUrl}/${locale}/contact`;

        // Format order items for email
        const orderItemsHtml = order.orderItems
          .map((item) => {
            const product = item.product;
            if (!product) {
              console.warn("Order item has no product:", item);
              return "";
            }
            return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${product.name || "Unknown Product"}</strong><br>
                <small>Quantity: ${item.quantity || 1}</small>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                €${parseFloat((product.price || 0).toString()).toFixed(2)}
              </td>
            </tr>
          `;
          })
          .filter((html) => html !== "") // Remove empty rows
          .join("");

        // Format address
        const address = order.address;
        const addressHtml = `
          <p><strong>${address.name || "N/A"}</strong></p>
          <p>${address.street || "N/A"}</p>
          <p>${address.city || "N/A"}, ${address.postalCode || "N/A"}</p>
          <p>${address.country || "N/A"}</p>
        `;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${templates.orderConfirmation.subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2c3e50;">${templates.orderConfirmation.subject}</h1>
              
              <p>${templates.orderConfirmation.greeting.replace("{name}", order.name)}</p>
              
              <p>${templates.orderConfirmation.message}</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${templates.orderConfirmation.orderDetails}</h3>
                <p><strong>${templates.orderConfirmation.orderNumber}:</strong> ${order.id}</p>
                <p><strong>${templates.orderConfirmation.orderDate}:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>${templates.orderConfirmation.totalAmount}:</strong> €${parseFloat(order.totalPrice.toString()).toFixed(2)}</p>
              </div>
              
              <h3>${templates.orderConfirmation.items}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left;">${templates.orderConfirmation.product}</th>
                    <th style="padding: 10px; text-align: right;">${templates.orderConfirmation.price}</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <h3>${templates.orderConfirmation.shippingAddress}</h3>
              ${addressHtml}
              
              <p>${templates.orderConfirmation.footer}</p>
              
              <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                  ${templates.orderConfirmation.contactInfo}
                </p>
                <div style="text-align: center;">
                  <a href="${websiteUrl}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    ${templates.orderConfirmation.website}
                  </a>
                  <a href="${contactUrl}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                    ${templates.orderConfirmation.support}
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        console.log("emailHtml", emailHtml);

        console.log("About to send email with:");
        console.log("- To:", order.email);
        console.log("- Subject:", templates.orderConfirmation.subject);
        console.log(
          "- Email service available:",
          !!strapi.plugins.email.services.email
        );

        await strapi.plugins.email.services.email.send({
          to: order.email,
          subject: templates.orderConfirmation.subject,
          html: emailHtml,
        });

        console.log(
          `Order confirmation email sent to ${order.email} for order ${order.id}`
        );
      } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error(
          `Failed to send order confirmation email: ${error.message}`
        );
      }
    },

    async sendOrderShippedEmail(order) {
      try {
        // Safety checks
        if (!order) {
          throw new Error("Order is null or undefined");
        }

        if (!order.orderItems || order.orderItems.length === 0) {
          throw new Error("Order has no orderItems");
        }

        if (!order.email) {
          throw new Error("Order has no email address");
        }

        // Get locale from the first product
        const locale = order.orderItems[0]?.product?.locale || "pt";

        // Get email templates based on locale
        const templates = getEmailTemplates(locale);

        // Get website URL
        const websiteUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const contactUrl = `${websiteUrl}/${locale}/contact`;

        // Format order items for email
        const orderItemsHtml = order.orderItems
          .map((item) => {
            const product = item.product;
            if (!product) {
              console.warn("Order item has no product:", item);
              return "";
            }
            return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${product.name || "Unknown Product"}</strong><br>
                <small>Quantity: ${item.quantity || 1}</small>
              </td>
            </tr>
          `;
          })
          .filter((html) => html !== "") // Remove empty rows
          .join("");

        // Tracking link section
        let trackingSection = "";
        if (order.trackingLink) {
          trackingSection = `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${templates.orderShipped.trackingInfo}</h3>
              <p><a href="${order.trackingLink}" style="color: #27ae60; text-decoration: none;">${templates.orderShipped.trackPackage}</a></p>
            </div>
          `;
        }

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${templates.orderShipped.subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #27ae60;">${templates.orderShipped.subject}</h1>
              
              <p>${templates.orderShipped.greeting.replace("{name}", order.name)}</p>
              
              <p>${templates.orderShipped.message}</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${templates.orderShipped.orderDetails}</h3>
                <p><strong>${templates.orderShipped.orderNumber}:</strong> ${order.id}</p>
                <p><strong>${templates.orderShipped.orderDate}:</strong> ${new Date(order.date).toLocaleDateString()}</p>
              </div>
              
              <h3>${templates.orderShipped.items}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              ${trackingSection}
              
              <p>${templates.orderShipped.footer}</p>
              
              <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                  ${templates.orderShipped.contactInfo}
                </p>
                <div style="text-align: center;">
                  <a href="${websiteUrl}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    ${templates.orderShipped.website}
                  </a>
                  <a href="${contactUrl}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                    ${templates.orderShipped.support}
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await strapi.plugins.email.services.email.send({
          to: order.email,
          subject: templates.orderShipped.subject,
          html: emailHtml,
        });

        console.log(
          `Order shipped email sent to ${order.email} for order ${order.id}`
        );
      } catch (error) {
        console.error("Error sending order shipped email:", error);
        throw new Error(`Failed to send order shipped email: ${error.message}`);
      }
    },
  })
);
