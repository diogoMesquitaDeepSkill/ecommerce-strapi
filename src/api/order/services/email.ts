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

        // Send team notification email
        await strapi.service("api::order.email").sendTeamNotificationEmail(order);
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

    async sendTeamNotificationEmail(order) {
      try {
        // Safety checks
        if (!order) {
          throw new Error("Order is null or undefined");
        }

        if (!order.orderItems || order.orderItems.length === 0) {
          throw new Error("Order has no orderItems");
        }

        const teamEmail = process.env.EMAIL_SUPPORT;
        if (!teamEmail) {
          throw new Error("EMAIL_SUPPORT environment variable not set");
        }

        const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
        const orderUrl = `${strapiUrl}/admin/content-manager/collection-types/api::order.order/${order.documentId}`;
        const stripeUrl = "https://dashboard.stripe.com/";

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
                <small>Quantidade: ${item.quantity || 1}</small>
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
            <title>Nova Encomenda Paga - Ação Necessária</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #27ae60;">🛍️ Nova Encomenda Paga</h1>
              
              <p><strong>Uma nova encomenda foi paga e requer processamento!</strong></p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Detalhes da Encomenda</h3>
                <p><strong>Número da Encomenda:</strong> ${order.id}</p>
                <p><strong>Data da Encomenda:</strong> ${new Date(order.date).toLocaleDateString('pt-PT')}</p>
                <p><strong>Valor Total:</strong> €${parseFloat(order.totalPrice.toString()).toFixed(2)}</p>
                <p><strong>Email do Cliente:</strong> ${order.email}</p>
                <p><strong>Telefone:</strong> ${order.phoneNumber || "Não fornecido"}</p>
                <p><strong>Método de Envio:</strong> ${order.shippingMethod || "Não especificado"}</p>
              </div>
              
              <h3>Artigos Encomendados</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left;">Produto</th>
                    <th style="padding: 10px; text-align: right;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <h3>Morada de Entrega</h3>
              ${addressHtml}
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>📋 Ações Necessárias:</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  <li><strong>Verificar a encomenda no Strapi:</strong> <a href="${orderUrl}" style="color: #007bff;">Clique aqui para abrir no Strapi</a></li>
                  <li><strong>Confirmar o pagamento no Stripe:</strong> <a href="${stripeUrl}" style="color: #007bff;">Aceder ao Dashboard Stripe</a></li>
                  <li><strong>Adicionar link de rastreamento:</strong> No Strapi, adicionar o campo "trackingLink"</li>
                  <li><strong>Alterar status para "shipped":</strong> No Strapi, alterar o campo "standing" para "shipped"</li>
                </ol>
              </div>
              
              <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;"><strong>💡 Dica:</strong> Após marcar como "shipped", o cliente receberá automaticamente um email de confirmação de envio.</p>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Este email foi enviado automaticamente quando a encomenda foi marcada como paga.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        await strapi.plugins.email.services.email.send({
          to: teamEmail,
          subject: `🛍️ Nova Encomenda Paga - #${order.id} - €${parseFloat(order.totalPrice.toString()).toFixed(2)}`,
          html: emailHtml,
        });

        console.log(
          `Team notification email sent to ${teamEmail} for order ${order.id}`
        );
      } catch (error) {
        console.error("Error sending team notification email:", error);
        throw new Error(
          `Failed to send team notification email: ${error.message}`
        );
      }
    },
  })
);
