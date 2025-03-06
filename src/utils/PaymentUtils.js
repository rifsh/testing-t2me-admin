// utils/PaymentUtils.js

/**
 * Process payment methods data for API submission
 * @param {Array} paymentMethods - Array of payment method objects from form
 * @returns {Array} - Processed payment methods ready for API
 */
export const processPaymentMethods = (paymentMethods) => {
    if (!paymentMethods || !Array.isArray(paymentMethods)) {
      return [];
    }
  
    return paymentMethods.map(method => {
      const baseData = {
        payment_type: method.paymentType,
        payment_charge: method.paymentCharge || 0,
        authorized_url: method.authorizedUrl || "",
      };
  
      // Add specific fields based on payment type
      switch (method.paymentType) {
        case "upi":
          return {
            ...baseData,
            provider: method.upiProvider,
            qr_code: method.qrCode && method.qrCode[0]?.uid ? method.qrCode[0].uid : null,
          };
        case "card":
          return {
            ...baseData,
            card_type: method.cardType,
            bank_name: method.bankName || "",
            bank_code: method.bankCode || "",
            image: method.bankImage && method.bankImage[0]?.uid ? method.bankImage[0].uid : null,
          };
        case "n-genius":
          return {
            ...baseData,
            merchant_id: method.merchantId || "",
            api_key: method.apiKey || "",
            outlet_reference: method.outletReference || "",
          };
        default:
          return baseData;
      }
    });
  };