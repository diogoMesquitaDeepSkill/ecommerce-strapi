/**
 * contact-form controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contact.contact', ({ strapi }) => ({
  async submit(ctx) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      if (!data.firstName || !data.lastName || !data.email || !data.subject || !data.message) {
        return ctx.badRequest('Missing required fields: firstName, lastName, email, subject, message');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return ctx.badRequest('Invalid email format');
      }

      // Validate phone format if provided
      if (data.phone) {
        // Remove all non-digit and non-plus characters for validation
        const cleanPhone = data.phone.replace(/[^\d+]/g, '');
        
        // Check if it contains only digits and optionally starts with +
        const phoneRegex = /^\+?[\d]{7,20}$/;
        
        if (!phoneRegex.test(cleanPhone)) {
          return ctx.badRequest('Invalid phone number format. Please enter a valid phone number with 7-20 digits.');
        }
      }

      // Get support email from environment variable
      const supportEmail = process.env.EMAIL_SUPPORT;
      if (!supportEmail) {
        console.error('EMAIL_SUPPORT environment variable not set');
        return ctx.internalServerError('Support email configuration missing');
      }

      // Get locale for email templates
      const locale = data.locale || 'en';

      // Get email templates
      const templates = getContactEmailTemplates(locale);

      // Create email HTML content
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${templates.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <h1 style="color: #2c3e50; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              ${templates.subject}
            </h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">${templates.contactDetails}</h3>
              <p style="margin: 8px 0;"><strong>${templates.name}:</strong> ${data.firstName} ${data.lastName}</p>
              <p style="margin: 8px 0;"><strong>${templates.email}:</strong> <a href="mailto:${data.email}" style="color: #3498db;">${data.email}</a></p>
              ${data.phone ? `<p style="margin: 8px 0;"><strong>${templates.phone}:</strong> <a href="tel:${data.phone}" style="color: #3498db;">${data.phone}</a></p>` : ''}
              <p style="margin: 8px 0;"><strong>${templates.subjectLabel}:</strong> ${data.subject}</p>
              ${data.orderId ? `<p style="margin: 8px 0;"><strong>${templates.orderId}:</strong> ${data.orderId}</p>` : ''}
            </div>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px;">${templates.messageLabel}</h3>
              <div style="background: #ffffff; padding: 25px; border: 2px solid #e9ecef; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.7; color: #2c3e50;">
                  ${data.message}
                </div>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 3px solid #95a5a6;">
              <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
                ${templates.footer}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email to support team
      await strapi.plugins.email.services.email.send({
        to: supportEmail,
        subject: `${templates.subject} - ${data.subject}`,
        html: emailHtml,
        replyTo: data.email, // Allow support team to reply directly to the customer
      });

      // Send confirmation email to customer
      const customerEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${templates.confirmationSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <h1 style="color: #2c3e50; margin-bottom: 30px; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
              ${templates.confirmationSubject}
            </h1>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${templates.confirmationGreeting.replace('{name}', data.firstName)}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              ${templates.confirmationMessage}
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">${templates.yourMessage}</h3>
              <p style="margin: 8px 0;"><strong>${templates.subjectLabel}:</strong> ${data.subject}</p>
              ${data.orderId ? `<p style="margin: 8px 0;"><strong>${templates.orderId}:</strong> ${data.orderId}</p>` : ''}
              ${data.phone ? `<p style="margin: 8px 0;"><strong>${templates.phone}:</strong> ${data.phone}</p>` : ''}
              <p style="margin: 15px 0 10px 0;"><strong>${templates.messageLabel}:</strong></p>
              <div style="background: #ffffff; padding: 20px; border: 2px solid #e9ecef; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.7; color: #2c3e50;">
                  ${data.message}
                </div>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 3px solid #95a5a6;">
              <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
                ${templates.confirmationFooter}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await strapi.plugins.email.services.email.send({
        to: data.email,
        subject: templates.confirmationSubject,
        html: customerEmailHtml,
      });

      return ctx.send({
        message: templates.successMessage,
        success: true,
      });

    } catch (error) {
      console.error('Error processing contact form submission:', error);
      return ctx.internalServerError('An error occurred while processing your request');
    }
  },
}));

// Email templates for contact form
const contactEmailTemplates = {
  en: {
    subject: 'New Contact Form Submission',
    contactDetails: 'Contact Details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    subjectLabel: 'Subject',
    orderId: 'Order ID',
    messageLabel: 'Message',
    footer: 'This message was sent from the contact form on your website.',
    confirmationSubject: 'Contact Form Submission Received',
    confirmationGreeting: 'Dear {name},',
    confirmationMessage: 'Thank you for contacting us. We have received your message and will get back to you as soon as possible.',
    yourMessage: 'Your Message',
    confirmationFooter: 'We typically respond within 24-48 hours during business days.',
    successMessage: 'Your message has been sent successfully. We will get back to you soon.',
  },
  pt: {
    subject: 'Nova Submissão do Formulário de Contacto',
    contactDetails: 'Detalhes de Contacto',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    subjectLabel: 'Assunto',
    orderId: 'ID da Encomenda',
    messageLabel: 'Mensagem',
    footer: 'Esta mensagem foi enviada através do formulário de contacto do seu website.',
    confirmationSubject: 'Submissão do Formulário de Contacto Recebida',
    confirmationGreeting: 'Cara/Caro {name},',
    confirmationMessage: 'Obrigada/o por nos contactar. Recebemos a sua mensagem e responderemos o mais rapidamente possível.',
    yourMessage: 'A Sua Mensagem',
    confirmationFooter: 'Normalmente respondemos dentro de 24-48 horas durante os dias úteis.',
    successMessage: 'A sua mensagem foi enviada com sucesso. Responderemos em breve.',
  },
  fr: {
    subject: 'Nouvelle Soumission du Formulaire de Contact',
    contactDetails: 'Détails de Contact',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    subjectLabel: 'Sujet',
    orderId: 'ID de Commande',
    messageLabel: 'Message',
    footer: 'Ce message a été envoyé depuis le formulaire de contact de votre site web.',
    confirmationSubject: 'Soumission du Formulaire de Contact Reçue',
    confirmationGreeting: 'Cher/Chère {name},',
    confirmationMessage: 'Merci de nous avoir contactés. Nous avons reçu votre message et nous vous répondrons dans les plus brefs délais.',
    yourMessage: 'Votre Message',
    confirmationFooter: 'Nous répondons généralement dans les 24-48 heures pendant les jours ouvrables.',
    successMessage: 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.',
  },
};

const getContactEmailTemplates = (locale: string) => {
  return contactEmailTemplates[locale as keyof typeof contactEmailTemplates] || contactEmailTemplates.en;
}; 