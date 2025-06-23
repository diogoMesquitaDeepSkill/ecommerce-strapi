export default () => {
  // Debug environment variables
  console.log("Email configuration debug:");
  console.log("BREVO_SMTP_USER exists:", !!process.env.BREVO_SMTP_USER);
  console.log("BREVO_SMTP_PASSWORD exists:", !!process.env.BREVO_SMTP_PASSWORD);
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  console.log("EMAIL_REPLY_TO:", process.env.EMAIL_REPLY_TO);

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
