export default {
  routes: [
    {
      method: "GET",
      path: "/orders/token/:token",
      handler: "order.findByToken",
    },
  ],
};
