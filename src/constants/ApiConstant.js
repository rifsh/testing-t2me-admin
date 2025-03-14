export const ApiConstant = {
  API_BASE_URL: "https://uat-tickets2me.mitetechnology.com",
  LOG_OUT: "/api/v1/auth/secured/logout",
  LEAD_REGISTER:"/api/v1/auth/public/register/lead_organizer",
  LEAD_OTP_VERIFY:"/api/v1/auth/public/lead_otp",
  LEAD_OTP_RESEND:"/api/v1/auth/public/resend/otp",
  CATEGORY_URL: "/api/v1/events/secured/category",
  CATEGORY_STATUS_URL: "/api/v1/events/secured/category_status",
  SUB_CATEGORY_STATUS_URL: "/api/v1/events/secured/subcategory_status",
  SINGLE_CATEGORY_URL: "/api/v1/events/secured/singlecategory",
  USER_URL: "/api/v1/auth/secured/users",
  USER_STATUS_URL: "/api/v1/auth/secured/users_status",
  SINGLE_USER_URL: "/api/v1/auth/secured/singleuser",
  REGISTER_USER_URL: "/api/v1/auth/secured/register",
  ROLES_URL: "/api/v1/auth/secured/role",
  SUB_CATEGORY_URL: "/api/v1/events/secured/subcategory",
  SUB_SINGLE_CATEGORY_URL: "/api/v1/events/secured/singlesubcategory",
  PLACE_WITH_COUNTRY_URL: "/api/v1/location/secured/place_with_country",
  PLACE_URL: "/api/v1/location/secured/place",
  EDIT_PLACE_URL: "/api/v1/location/secured/edit_place",
  EDIT_PLACE_STATUS_URL: "/api/v1/location/secured/edit_place_status",
  EDIT_VENUE_URL: "/api/v1/location/secured/edit_venue",
  EDIT_VENUE_STATUS_URL: "/api/v1/location/secured/edit_venue_status",
  VENUE_URL: "/api/v1/location/secured/venue",
  SINGLE_VENUE_URL: "/api/v1/location/secured/singlevenue",
  SINGLE_PLACE_URL: "/api/v1/location/secured/singleplace",
  COUNTRY_DETAILS_URL: "/api/v1/location/secured/country/details",
  EVENT_URL: "/api/v1/events/secured/event",
  LEAD_EVENT_URL: "/api/v1/events/secured/lead_event/creation",
  EVENT_VALIDATION_URL: "/api/v1/events/secured/validation_event",
  EVENT_DETAILS_URL: "/api/v1/events/secured/events/detail",
  LEAD_EVENT_DETAILS_URL:"/api/v1/events/secured/lead_event/single",
  LEAD_EVENT_MESSAGE_URL:"/api/v1/events/secured/lead_event/comment",
  PLACE_EVENTS_URL: "/api/v1/events/public/event",
  ORGANIZER_EVENTS_URL: "/api/v1/events/secured/event/organizer",
  EVENT_SUPPORT_AVAILABLE: "/api/v1/events/secured/events/support",
  EDIT_EVENT_URL: "/api/v1/events/secured/edit_event",
  EDIT_LEAD_EVENT_URL: "/api/v1/events/secured/edit_lead_event",
  LEAD_ENROL_USER: "/api/v1/events/secured/enroll_user_lead_event",
  EDIT_EVENT_STATUS_URL: "/api/v1/events/secured/edit_event_status",
  OFFER_URL: "/api/v1/offers/secured/offers",
  OFFER_STATUS_URL: "/api/v1/offers/secured/offers_status",
  OFFER_DETAIL_URL: "/api/v1/offers/secured/offers/detail",
  COUPON_URL: "/api/v1/offers/secured/coupons",
  COUPON_STATUS_URL: "/api/v1/offers/secured/coupons_status",
  COUPON_DETAILS_URL: "/api/v1/offers/secured/coupons/detail",

  TAX_URL: "/api/v1/location/secured/taxes",
  TAX_STATUS_URL: "/api/v1/location/secured/taxes_status",
  AVAILABLE_TAX_CATEGORY_URL: "/api/v1/location/secured/available_tax_category",
  TICKET_URL: "/api/v1/tickets/secured/ticketstructure",
  AVAILABLE_TICKET_TYPE_URL: "/api/v1/events/secured/available_types",
  SCHEDULE_URL: "/api/v1/events/secured/schedules",
  SINGLE_SCHEDULE_URL: "/api/v1/events/secured/schedules/details",
  STATICS_EVENT_LIST: "/api/v1/statics/secured/events",
  STATICS_USER_LIST: "/api/v1/statics/secured/users",
  STATICS_SCHEDULES_LIST: "/api/v1/statics/secured/schedules",
  ISSUE_LIST_URL: "/api/v1/issue/secured/issues",
  ISSUE_ALERT_LIST_URL: "/api/v1/issue/secured/issues/alert",
  ISSUE_CREATION_URL: "/api/v1/issue/public/issues",
  TICKET_ASSIGN_DETAILS_URL: "/api/v1/issue/secured/issues/assign/details",
  ISSUE_DETAILS_URL: "/api/v1/issue/secured/issues/details",
  ISSUE_STATUS_UPDATE_URL: "/api/v1/issue/secured/issues/status",
  ISSUE_CLOSE_URL: "/api/v1/issue/secured/issues/close",
  ISSUE_REASSIGN_URL: "/api/v1/issue/secured/issues/assign",
  ISSUE_REASSIGN_COMMENT_URL: "/api/v1/issue/secured/issues/comment",
  ADMIN_COMMENT_URL: "/api/v1/issue/secured/issues/comment/admin",

  // ADVERTISEMENT ENDPOINTS

  ADVERTISEMENT_CATEGORY_URL: "/api/v1/banners/secured/bannercategory",
  ADVERTISEMENT_BANNER_URL: "/api/v1/banners/secured/advertisementbanner",
  ADVERTISEMENT_SCHEDULE_URL: "/api/v1/banners/secured/advertisementschedule",
  ADVERTISEMENT_SCHEDULE_UPDATE_URL: "/api/v1/banners/secured/adscheduleupdate",
  ADVERTISEMENT_SINGLE_SCHEDULE_URL:
    "/api/v1/banners/secured/single_ad_schedule",
  ADVERTISEMENT_BANNER_UPDATE_URL:
    "/api/v1/banners/secured/advertisementbannerupdate",
  ADVERTISEMENT_BANNER_STATUS_UPDATE_URL:
    "/api/v1/banners/secured/advertisement_banner_status",
  ADVERTISEMENT_CATEGORY_UPDATE_URL:
    "/api/v1/banners/secured/bannercategoryupdate",
  ADVERTISEMENT_CATEGORY_STATUS_UPDATE_URL:
    "/api/v1/banners/secured/banner_category/status_update",
  ADVERTISEMENT_CATEGORY_BANNER_URL: "/api/v1/banners/secured/category_banners",
  ADVERTISEMENT_SCHEDULE_STATUS_URL:
    "/api/v1/banners/secured/schedule_banner_status",

  // EVENT ORGANIZER ENDPOINTS

  EVENT_ORGANIZER_UPDATES: "/api/v1/events/secured/neweventupdates",
  EVENT_ORGANIZER_SINGLE_UPDATE: "/api/v1/events/secured/singleeventupdate",
  EVENT_ORGANIZER_SINGLE_UPDATE_PUT:
    "/api/v1/events/secured/superadminapproval",
  EVENT_ORGANIZER_EVENT_UPDATE: "/api/v1/events/secured/organizer_event_update",
  EVENT_ORGANIZER_EVENT_UPDATE_RECHANGES:
    "/api/v1/events/secured/organizer_event_secondary_update",

  // VALIDATION API ENDPOINTS

  PLACE_VALIDATE_URL: "/api/v1/validation/secured/validate_place",
  COUNTRY_VALIDATE_URL: "/api/v1/validation/secured/validate_country",
  CATEGORY_VALIDATE_URL: "/api/v1/validation/secured/validate_category",
  SUB_CATEGORY_VALIDATE_URL: "/api/v1/validation/secured/validate_subcategory",
  VENUE_VALIDATE_URL: "/api/v1/validation/secured/validate_venue",
  TAX_VALIDATE_URL: "/api/v1/validation/secured/validate_tax",
  MULT_EVENT_VALIDATE_URL: "/api/v1/validation/secured/validate_multiple_event",
  TICKET_VALIDATE_URL: "/api/v1/validation/secured/validate_ticket",
  OFFER_COUPON_VALIDATE_URL: "/api/v1/validation/secured/validate_offer_coupon",
  ADCATEGORY_VALIDATE_URL: "/api/v1/validation/secured/validate_ad_category",

  // FOOTER URLS

  FAQ_URL: "https://cdn-assets.ticket2me.app/faq/v1.0.0.json",
  BUCKET_URL:
    "https://de64063e3b101c4412b924b8c25193ae.r2.cloudflarestorage.com",
  BUCKET_NAME: "ticket2me-json",
  BUCKET_FAQ_KEY: "faq/v1.0.0.json",
  BUCKET_INFO_KEY: "info/v1.0.0.json",
  FAQ_UPLOAD_URL: "/api/v1/app_management/secured/upload_faq",
  FAQ_GET_URL: "/api/v1/app_management/public/get_faq",
  INFO_UPLOAD_URL: "/api/v1/app_management/secured/upload_info",
  INFO_GET_URL: "/api/v1/app_management/public/get_info",
  FOOTER_GET_URL: "/api/v1/app_management/public/get_footer",
  FOOTER_UPLOAD_URL: "/api/v1/app_management/secured/upload_footer",

  //Payment
  PAYMENT_URL: "/api/v1/payment/secured/payment",

  // lead event list
  LEAD_EVENT_LIST: "/api/v1/events/secured/customer_event",
  SINGLE_CUSTOMER_LEAD_EVENT: '/api/v1/events/secured/single_customer_event'
};
