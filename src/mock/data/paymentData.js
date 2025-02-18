const PaymentData = {};
PaymentData.fetchPaymentDataList = {
  data: [
    {
      items: [
        {
          place_id: 1,
          id: 1,
          jsonData: {
            place_name: "Dubai",
            event: "Dubai Eve",
            service_adons: [
              {
                name: "sms",
                logo: "https://img.freepik.com/free-vector/new-message-concept-landing-page_52683-26980.jpg",
              },
              {
                name: "whatsapp",
                logo: "https://global.ariseplay.com/amg/www.arise.tv/uploads/2021/02/WhatsApp.jpg",
              },
            ],
            payment_logos: [
              {
                name: "paypal",
                logo: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/250_Paypal_logo-512.png",
              },
              {
                name: "visa",
                logo: "https://static-00.iconduck.com/assets.00/visa-icon-2048x628-6yzgq2vq.png",
              },
            ],
            card_types: [
              {
                type: "debit_card",
                details: {
                  provider: "Visa",
                  logo: "https://static-00.iconduck.com/assets.00/visa-icon-2048x628-6yzgq2vq.png",
                },
              },
              {
                type: "credit_card",
                details: {
                  provider: "MasterCard",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
                },
              },
            ],
          },
        },
        {
          place_id: 2,
          id: 2,
          jsonData: {
            place_name: "India",
            event: "Vanitha Film Awards",
            service_adons: [
              {
                name: "email",
                logo: "https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/112-gmail_email_mail-512.png",
              },
              {
                name: "whatsapp",
                logo: "https://global.ariseplay.com/amg/www.arise.tv/uploads/2021/02/WhatsApp.jpg",
              },
            ],
            payment_logos: [
              {
                name: "Gpay",
                logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiIGP8AjoANINXuurBvuZEg4AnQseuKFYbXw&s",
              },
              {
                name: "visa",
                logo: "https://static-00.iconduck.com/assets.00/visa-icon-2048x628-6yzgq2vq.png",
              },
            ],
            card_types: [
              {
                type: "debit_card",
                details: {
                  provider: "RuPay",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/RuPay-Logo.png",
                },
              },
              {
                type: "credit_card",
                details: {
                  provider: "American Express",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg",
                },
              },
            ],
          },
        },
      ],
      total: 34,
      page: 1,
      size: 10,
      pages: 4,
    },
  ],
  status: {
    message: "success",
    status_code: "00000",
  },
};

export default PaymentData;
