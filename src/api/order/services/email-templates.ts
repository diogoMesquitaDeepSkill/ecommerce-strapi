export const emailTemplates = {
  pt: {
    orderConfirmation: {
      subject: "Confirmação da Encomenda - Pagamento Recebido",
      greeting: "Cara/Caro {name},",
      message:
        "Obrigada/o pela sua encomenda! Recebemos o seu pagamento e a sua encomenda está a ser processada.",
      orderDetails: "Detalhes da Encomenda",
      orderNumber: "Número da Encomenda",
      orderDate: "Data da Encomenda",
      totalAmount: "Valor Total",
      items: "Artigos Encomendados",
      product: "Produto",
      price: "Preço",
      shippingAddress: "Morada de Entrega",
      footer: "Enviaremos os produtos nos próximos dias e receberá um email com o link de rastreamento assim que a sua encomenda for expedida.",
      contactInfo:
        "Se tiver alguma dúvida, entre em contacto connosco através do nosso website.",
      website: "Visite o nosso website",
      support: "Contacte-nos",
    },
    orderShipped: {
      subject: "A Sua Encomenda Foi Expedida!",
      greeting: "Cara/Caro {name},",
      message:
        "Excelentes notícias! A sua encomenda foi expedida e está a caminho.",
      orderDetails: "Detalhes da Encomenda",
      orderNumber: "Número da Encomenda",
      orderDate: "Data da Encomenda",
      items: "Artigos Expedidos",
      trackingInfo: "Informações de Rastreamento",
      trackPackage: "Rastrear a Sua Encomenda",
      footer:
        "A sua encomenda deve chegar dentro do prazo de entrega estimado.",
      contactInfo:
        "Se tiver alguma dúvida sobre a sua entrega, entre em contacto connosco através do nosso website.",
      website: "Visite o nosso website",
      support: "Contacte-nos",
    },
  },
  en: {
    orderConfirmation: {
      subject: "Order Confirmation - Payment Received",
      greeting: "Dear {name},",
      message:
        "Thank you for your order! We have received your payment and your order is being processed.",
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      totalAmount: "Total Amount",
      items: "Items Ordered",
      product: "Product",
      price: "Price",
      shippingAddress: "Shipping Address",
      footer: "We will ship the products in the next few days and you will receive an email with the tracking link once your order has been shipped.",
      contactInfo:
        "If you have any questions, please contact us through our website.",
      website: "Visit our website",
      support: "Contact us",
    },
    orderShipped: {
      subject: "Your Order Has Been Shipped!",
      greeting: "Dear {name},",
      message:
        "Great news! Your order has been shipped and is on its way to you.",
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      items: "Items Shipped",
      trackingInfo: "Tracking Information",
      trackPackage: "Track Your Package",
      footer: "Your order should arrive within the estimated delivery time.",
      contactInfo:
        "If you have any questions about your shipment, please contact us through our website.",
      website: "Visit our website",
      support: "Contact us",
    },
  },
  fr: {
    orderConfirmation: {
      subject: "Confirmation de Commande - Paiement Reçu",
      greeting: "Cher/Chère {name},",
      message:
        "Merci pour votre commande ! Nous avons reçu votre paiement et votre commande est en cours de traitement.",
      orderDetails: "Détails de la Commande",
      orderNumber: "Numéro de Commande",
      orderDate: "Date de Commande",
      totalAmount: "Montant Total",
      items: "Articles Commandés",
      product: "Produit",
      price: "Prix",
      shippingAddress: "Adresse de Livraison",
      footer:
        "Nous expédierons les produits dans les prochains jours et vous recevrez un email avec le lien de suivi dès que votre commande sera expédiée.",
      contactInfo:
        "Si vous avez des questions, veuillez nous contacter via notre site web.",
      website: "Visitez notre site web",
      support: "Contactez-nous",
    },
    orderShipped: {
      subject: "Votre Commande a Été Expédiée !",
      greeting: "Cher/Chère {name},",
      message:
        "Excellentes nouvelles ! Votre commande a été expédiée et est en route.",
      orderDetails: "Détails de la Commande",
      orderNumber: "Numéro de Commande",
      orderDate: "Date de Commande",
      items: "Articles Expédiés",
      trackingInfo: "Informations de Suivi",
      trackPackage: "Suivre Votre Colis",
      footer:
        "Votre commande devrait arriver dans le délai de livraison estimé.",
      contactInfo:
        "Si vous avez des questions concernant votre livraison, veuillez nous contacter via notre site web.",
      website: "Visitez notre site web",
      support: "Contactez-nous",
    },
  },
};

export const getEmailTemplates = (locale: string) => {
  return (
    emailTemplates[locale as keyof typeof emailTemplates] || emailTemplates.en
  );
};
