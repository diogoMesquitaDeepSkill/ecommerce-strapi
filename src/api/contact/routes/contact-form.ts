/**
 * contact-form router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/contact-form',
      handler: 'contact-form.submit',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 