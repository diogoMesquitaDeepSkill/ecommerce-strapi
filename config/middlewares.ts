export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [
        "http://localhost:1337",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  { name: "strapi::body", config: { includeUnparsed: true } },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
