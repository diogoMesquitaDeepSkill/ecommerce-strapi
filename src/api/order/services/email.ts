import { factories } from "@strapi/strapi";

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
        const templates = await this.getEmailTemplates(locale);

        console.log("BREVO_API_KEY exists:", process.env.BREVO_API_KEY);

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
              
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                ${templates.orderConfirmation.contactInfo}
              </p>
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
        const templates = await this.getEmailTemplates(locale);

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
              
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                ${templates.orderShipped.contactInfo}
              </p>
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

    async getEmailTemplates(locale) {
      // Email templates for different locales
      const templates = {
        pt: {
          orderConfirmation: {
            subject: "Confirmação do Pedido - Seu Pedido Foi Recebido",
            greeting: "Olá {name},",
            message:
              "Obrigado pelo seu pedido! Recebemos o seu pedido e está sendo processado.",
            orderDetails: "Detalhes do Pedido",
            orderNumber: "Número do Pedido",
            orderDate: "Data do Pedido",
            totalAmount: "Valor Total",
            items: "Itens Encomendados",
            product: "Produto",
            price: "Preço",
            shippingAddress: "Endereço de Entrega",
            footer: "Enviaremos um email assim que o seu pedido for enviado.",
            contactInfo:
              "Se tiver alguma dúvida, entre em contacto com a nossa equipa de apoio.",
          },
          orderShipped: {
            subject: "Seu Pedido Foi Enviado!",
            greeting: "Olá {name},",
            message:
              "Ótimas notícias! O seu pedido foi enviado e está a caminho.",
            orderDetails: "Detalhes do Pedido",
            orderNumber: "Número do Pedido",
            orderDate: "Data do Pedido",
            items: "Itens Enviados",
            trackingInfo: "Informações de Rastreamento",
            trackPackage: "Rastrear o Seu Pacote",
            footer:
              "O seu pedido deve chegar dentro do tempo de entrega estimado.",
            contactInfo:
              "Se tiver alguma dúvida sobre a sua entrega, entre em contacto com a nossa equipa de apoio.",
          },
        },
        en: {
          orderConfirmation: {
            subject: "Order Confirmation - Your Order Has Been Received",
            greeting: "Hello {name},",
            message:
              "Thank you for your order! We have received your order and it is being processed.",
            orderDetails: "Order Details",
            orderNumber: "Order Number",
            orderDate: "Order Date",
            totalAmount: "Total Amount",
            items: "Items Ordered",
            product: "Product",
            price: "Price",
            shippingAddress: "Shipping Address",
            footer:
              "We will send you an email once your order has been shipped.",
            contactInfo:
              "If you have any questions, please contact our support team.",
          },
          orderShipped: {
            subject: "Your Order Has Been Shipped!",
            greeting: "Hello {name},",
            message:
              "Great news! Your order has been shipped and is on its way to you.",
            orderDetails: "Order Details",
            orderNumber: "Order Number",
            orderDate: "Order Date",
            items: "Items Shipped",
            trackingInfo: "Tracking Information",
            trackPackage: "Track Your Package",
            footer:
              "Your order should arrive within the estimated delivery time.",
            contactInfo:
              "If you have any questions about your shipment, please contact our support team.",
          },
        },
      };

      return templates[locale] || templates.en; // Default to English if locale not found
    },
  })
);
