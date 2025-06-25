export default () => {

  return {
    email: {
      config: {
        provider: "@strapi/provider-email-nodemailer",
        providerOptions: {
          host: "smtp-relay.brevo.com",
          port: 587,
          auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASSWORD,
          },
          secure: false,
          requireTLS: true,
          tls: {
            rejectUnauthorized: false, // This will ignore SSL certificate issues
          },
        },
        settings: {
          defaultFrom: process.env.EMAIL_FROM,
          defaultReplyTo: process.env.EMAIL_REPLY_TO,
        },
      },
    },
  };
};
