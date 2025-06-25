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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">${templates.subject}</h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${templates.contactDetails}</h3>
              <p><strong>${templates.name}:</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>${templates.email}:</strong> ${data.email}</p>
              <p><strong>${templates.subjectLabel}:</strong> ${data.subject}</p>
              ${data.orderId ? `<p><strong>${templates.orderId}:</strong> ${data.orderId}</p>` : ''}
            </div>
            
            <h3>${templates.messageLabel}</h3>
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">${templates.confirmationSubject}</h1>
            
            <p>${templates.confirmationGreeting.replace('{name}', data.firstName)}</p>
            
            <p>${templates.confirmationMessage}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${templates.yourMessage}</h3>
              <p><strong>${templates.subjectLabel}:</strong> ${data.subject}</p>
              ${data.orderId ? `<p><strong>${templates.orderId}:</strong> ${data.orderId}</p>` : ''}
              <p><strong>${templates.messageLabel}:</strong></p>
              <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0;">
                <p style="white-space: pre-wrap;">${data.message}</p>
              </div>
            </div>
            
            <p>${templates.confirmationFooter}</p>
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