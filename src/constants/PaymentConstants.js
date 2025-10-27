export const PAYMENT_METHODS = {
  N_GENIUS: "N-Genius Online",
  UPI: "UPI",
  CARD_PAYMENT: "Card Payment",
  HDFC_SMART_GATEWAY: "HDFC SmartGateway",
};

// UPI providers
export const UPI_PROVIDERS = [
  { value: "googlepay", label: "Google Pay" },
  { value: "paytm", label: "Paytm" },
  { value: "phonepe", label: "PhonePe" },
  { value: "bhim", label: "BHIM UPI" },
  { value: "amazonpay", label: "Amazon Pay" },
];

// Card types
export const CARD_TYPES = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "American Express" },
  { value: "rupay", label: "RuPay" },
  { value: "discover", label: "Discover" },
];
export const SERVICE_TYPE = [
  { value: "whatsapp-reminder", name: "WhatsApp Reminder" },
  { value: "whatsapp-tickets-sent", name: "Send Tickets via WhatsApp" },
  { value: "email-notification", name: "Email Notification" },
  { value: "sms-alert", name: "SMS Alert" },
  { value: "call-reminder", name: "Call Reminder" },
  // { code: "email-invoice", label: "Email Invoice", code: "email-inv" },
  // { code: "push-notification", label: "Push Notification", code: "push-notif" },
  // { value: "telegram-notification", label: "Telegram Notification", code: "tlgm-notif" },
  // { value: "in-app-message", label: "In-App Message", code: "inapp-msg" }
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "paid", label: "PAID" },
  { value: "processing", label: "PROCESSING" },
  { value: "failed", label: "FAILED" },
];