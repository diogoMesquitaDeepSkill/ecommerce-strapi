export default ({ env }) => ({
  stripe: {
    secretKey: env('STRIPE_SECRET_KEY'),
    publishableKey: env('STRIPE_PUBLISHABLE_KEY'),
    webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
  },
}); 