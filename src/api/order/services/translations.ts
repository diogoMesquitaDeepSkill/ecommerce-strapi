/**
 * Translation service for order statuses
 */

export const orderStatusTranslations = {
  en: {
    unpaid: "Unpaid",
    paid: "Paid",
    shipped: "Shipped",
    arrived: "Arrived",
    completed: "Completed",
    canceled: "Canceled",
    problem: "Problem",
  },
  pt: {
    unpaid: "Não Pago",
    paid: "Pago",
    shipped: "Enviado",
    arrived: "Entregue",
    completed: "Concluído",
    canceled: "Cancelado",
    problem: "Problema",
  },
  es: {
    unpaid: "No Pagado",
    paid: "Pagado",
    shipped: "Enviado",
    arrived: "Entregado",
    completed: "Completado",
    canceled: "Cancelado",
    problem: "Problema",
  },
  fr: {
    unpaid: "Non Payé",
    paid: "Payé",
    shipped: "Expédié",
    arrived: "Livré",
    completed: "Terminé",
    canceled: "Annulé",
    problem: "Problème",
  },
  de: {
    unpaid: "Nicht Bezahlt",
    paid: "Bezahlt",
    shipped: "Versendet",
    arrived: "Geliefert",
    completed: "Abgeschlossen",
    canceled: "Storniert",
    problem: "Problem",
  },
};

export const translateOrderStatus = (
  status: string,
  locale: string = "en"
): string => {
  const translations =
    orderStatusTranslations[locale as keyof typeof orderStatusTranslations];
  if (!translations) {
    return (
      orderStatusTranslations.en[
        status as keyof typeof orderStatusTranslations.en
      ] || status
    );
  }
  return translations[status as keyof typeof translations] || status;
};
