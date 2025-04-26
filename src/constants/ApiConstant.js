export const ApiConstant = {
  API_BASE_URL: "https://uat-tickets2me.mitetechnology.com",
  LOGIN: "/api/v1/shared/auth/public/token",
  LOG_OUT: "/api/v1/shared/auth/secured/logout",
  LEAD_REGISTER: "/api/v1/shared/auth/public/register/lead_organizer",
  LEAD_OTP_VERIFY: "/api/v1/shared/auth/public/lead_otp",
  LEAD_OTP_RESEND: "/api/v1/shared/auth/public/resend/otp",
  TERMS_AND_CONDITION: "/api/v1/shared/app_management/public/terms_condition",
  POTS_TERMS_AND_CONDITION:
    "/api/v1/shared/app_management/secured/terms_condition",
  CATEGORY_URL: "/api/v1/shared/category/secured/category",
  CATEGORY_STATUS_URL: "/api/v1/shared/category/secured/category_status",
  SUB_CATEGORY_STATUS_URL: "/api/v1/shared/category/secured/subcategory_status",
  SINGLE_CATEGORY_URL: "/api/v1/shared/category/secured/singlecategory",
  USER_URL: "/api/v1/shared/auth/secured/users",
  USER_STATUS_URL: "/api/v1/shared/auth/secured/users_status",
  SINGLE_USER_URL: "/api/v1/shared/auth/secured/singleuser",
  REGISTER_USER_URL: "/api/v1/shared/auth/secured/register",
  ROLES_URL: "/api/v1/shared/auth/secured/role",
  SUB_CATEGORY_URL: "/api/v1/shared/category/secured/subcategory",
  SUB_SINGLE_CATEGORY_URL: "/api/v1/shared/category/secured/singlesubcategory",
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
  EVENT_URL: "/api/v1/event/events/secured/event",
  LEAD_EVENT_URL: "/api/v1/event/events/secured/lead_event/creation",
  EVENT_VALIDATION_URL: "/api/v1/event/events/secured/validation_event",
  EVENT_DETAILS_URL: "/api/v1/event/events/secured/events/detail",
  EVENT_TYPE_OPTION_URL: "/api/v1/event/events/secured/event_type/options",
  EVENT_TYPE_URL: "/api/v1/event/events/secured/event_type",
  EVENT_TYPE_DETAILS_URL: "/api/v1/event/events/secured/event_type/detail",
  EVENT_TYPE_STATUS_URL: "/api/v1/event/events/secured/event_type/status",
  LEAD_EVENT_DETAILS_URL: "/api/v1/event/events/secured/lead_event/single",
  LEAD_EVENT_MESSAGE_URL: "/api/v1/event/events/secured/lead_event/comment",
  PLACE_EVENTS_URL: "/api/v1/event/events/public/event",
  ORGANIZER_EVENTS_URL: "/api/v1/event/events/secured/event/organizer",
  EVENT_SUPPORT_AVAILABLE: "/api/v1/event/events/secured/events/support",
  EDIT_EVENT_URL: "/api/v1/event/events/secured/edit_event",
  EDIT_LEAD_EVENT_URL: "/api/v1/event/events/secured/edit_lead_event",
  LEAD_ENROL_USER: "/api/v1/event/events/secured/enroll_user_lead_event",
  LEAD_EVENT_STATUS: "/api/v1/event/events/secured/edit_lead_event_status",
  EDIT_EVENT_STATUS_URL: "/api/v1/event/events/secured/edit_event_status",
  OFFER_URL: "/api/v1/shared/offers/secured/offers",
  OFFER_STATUS_URL: "/api/v1/shared/offers/secured/offers_status",
  OFFER_DETAIL_URL: "/api/v1/shared/offers/secured/offers/detail",
  COUPON_URL: "/api/v1/shared/offers/secured/coupons",
  COUPON_STATUS_URL: "/api/v1/shared/offers/secured/coupons_status",
  COUPON_DETAILS_URL: "/api/v1/shared/offers/secured/coupons/detail",

  TAX_URL: "/api/v1/location/secured/taxes",
  TAX_STATUS_URL: "/api/v1/location/secured/taxes_status",
  AVAILABLE_TAX_CATEGORY_URL: "/api/v1/location/secured/available_tax_category",
  TICKET_URL: "/api/v1/event/tickets/secured/ticketstructure",
  AVAILABLE_TICKET_TYPE_URL: "/api/v1/event/events/secured/available_types",
  SCHEDULE_URL: "/api/v1/event/schedule/secured/schedules",
  SINGLE_SCHEDULE_URL: "/api/v1/event/schedule/secured/schedules/details",
  STATICS_EVENT_LIST: "/api/v1/shared/statics/secured/events",
  STATICS_USER_LIST: "/api/v1/shared/statics/secured/users",
  STATICS_SCHEDULES_LIST: "/api/v1/shared/statics/secured/schedules",
  ISSUE_LIST_URL: "/api/v1/shared/issue/secured/issues",
  ISSUE_ALERT_LIST_URL: "/api/v1/shared/issue/secured/issues/alert",
  ISSUE_CREATION_URL: "/api/v1/shared/issue/public/issues",
  TICKET_ASSIGN_DETAILS_URL:
    "/api/v1/shared/issue/secured/issues/assign/details",
  ISSUE_DETAILS_URL: "/api/v1/shared/issue/secured/issues/details",
  ISSUE_STATUS_UPDATE_URL: "/api/v1/shared/issue/secured/issues/status",
  ISSUE_CLOSE_URL: "/api/v1/shared/issue/secured/issues/close",
  ISSUE_REASSIGN_URL: "/api/v1/shared/issue/secured/issues/assign",
  ISSUE_REASSIGN_COMMENT_URL: "/api/v1/shared/issue/secured/issues/comment",
  ADMIN_COMMENT_URL: "/api/v1/shared/issue/secured/issues/comment/admin",

  // ADVERTISEMENT ENDPOINTS

  ADVERTISEMENT_CATEGORY_URL: "/api/v1/shared/banners/secured/bannercategory",
  ADVERTISEMENT_BANNER_URL:
    "/api/v1/shared/banners/secured/advertisementbanner",
  ADVERTISEMENT_SCHEDULE_URL:
    "/api/v1/shared/banners/secured/advertisementschedule",
  ADVERTISEMENT_SCHEDULE_UPDATE_URL:
    "/api/v1/shared/banners/secured/adscheduleupdate",
  ADVERTISEMENT_SINGLE_SCHEDULE_URL:
    "/api/v1/shared/banners/secured/single_ad_schedule",
  ADVERTISEMENT_BANNER_UPDATE_URL:
    "/api/v1/shared/banners/secured/advertisementbannerupdate",
  ADVERTISEMENT_BANNER_STATUS_UPDATE_URL:
    "/api/v1/shared/banners/secured/advertisement_banner_status",
  ADVERTISEMENT_CATEGORY_UPDATE_URL:
    "/api/v1/shared/banners/secured/bannercategoryupdate",
  ADVERTISEMENT_CATEGORY_STATUS_UPDATE_URL:
    "/api/v1/shared/banners/secured/banner_category/status_update",
  ADVERTISEMENT_CATEGORY_BANNER_URL:
    "/api/v1/shared/banners/secured/category_banners",
  ADVERTISEMENT_SCHEDULE_STATUS_URL:
    "/api/v1/shared/banners/secured/schedule_banner_status",

  // EVENT ORGANIZER ENDPOINTS

  EVENT_ORGANIZER_UPDATES: "/api/v1/event/events/secured/neweventupdates",
  EVENT_ORGANIZER_SINGLE_UPDATE:
    "/api/v1/event/events/secured/singleeventupdate",
  EVENT_ORGANIZER_SINGLE_UPDATE_PUT:
    "/api/v1/event/events/secured/superadminapproval",
  EVENT_ORGANIZER_EVENT_UPDATE:
    "/api/v1/event/events/secured/organizer_event_update",
  EVENT_ORGANIZER_EVENT_UPDATE_RECHANGES:
    "/api/v1/event/events/secured/organizer_event_secondary_update",

  // THEATER API ENDPOINTS
  ADD_THEATER_URL: "/api/v1/movie/movies/secured/theatre/create",
  EDIT_THEATER_URL: "/api/v1/movie/movies/secured/theatre/edit",
  EDIT_THEATER_STATUS_URL: "/api/v1/movie/movies/secured/theatre/edit/status",
  GET_THEATER_URL: "/api/v1/movie/movies/secured/theatre/by_venue",
  GET_THEATER_DROPDOWN_URL: "/api/v1/movie/movies/secured/theatre/all",
  GET_THEATERBYID_URL: "/api/v1/movie/movies/secured/theatre/single",

  // THEATER_COMPANY API ENDPOINTS
  ADD_THEATER_COMPANY_URL:
    "/api/v1/movie/movies/secured/theatre_company/create",
  EDIT_THEATER_COMPANY_URL: "/api/v1/movie/movies/secured/theatre_company/edit",
  EDIT_THEATER_COMPANY_STATUS_URL:
    "/api/v1/movie/movies/secured/theatre_company/status",
  GET_THEATER_COMPANY_URL: "/api/v1/movie/movies/secured/theatre_company/all",
  GET_THEATER_COMPANY_BYID_URL:
    "/api/v1/movie/movies/secured/theatre_company/single",

  //SCREEN API ENDPOINTS
  ADD_SCREEN_URL: "/api/v1/movie/movies/secured/screens/creation",
  EDIT_SCREEN_URL: "/api/v1/movie/movies/secured/screens/edit",
  EDIT_SCREEN_STATUS_URL: "/api/v1/movie/movies/secured/screens/edit_status",
  GET_ALL_SCREEN_URL: "/api/v1/movie/movies/secured/screens",
  GET_SCREEN_ById_URL: "/api/v1/movie/movies/secured/screens/single",
  FETCH_SCREEN_TECH_URL: "/api/v1/movie/movies/secured/screens/tech",
  FETCH_SCREEN_AUDIO_URL: "/api/v1/movie/movies/secured/screens/audio",
  FETCH_SCREEN_FEATURE_URL: "/api/v1/movie/movies/secured/screens/feature",

  // MOVIE_API_ENDPOINTS
  ADD_MOVIE_URL: "/api/v1/movie/movies/secured/movie/create",
  GET_MOVIE_URL: "/api/v1/movie/movies/secured/movie/list",
  GET_MOVIEBYID_URL: "/api/v1/movie/movies/secured/movie/single",
  EDIT_MOVIE_STATUS_URL: "/api/v1/movie/movies/secured/movie/edit_status",
  EDIT_MOVIE_URL: "/api/v1/movie/movies/secured/movie/edit",

  // LANGUAGE_API_ENDPOINTS
  GET_LANGUAGES: "/api/v1/movie/movies/secured/languages",
  // GENRES_API_ENDPOINTS
  GET_GENRES: "/api/v1/movie/movies/secured/genre",

  //PERSONALITY_API_ENDPOINTS
  ADD_PERSONALITY_URL: "/api/v1/movie/movies/secured/personality",
  GET_PERSONALITY_URL: "/api/v1/movie/movies/secured/personality",
  GET_PERSONALITYBYID_URL: "/api/v1/movie/movies/secured/personality/single",
  EDIT_PERSONALITY_STATUS_URL:
    "/api/v1/movie/movies/secured/personality/edit_status",
  EDIT_PERSONALITY_URL: "/api/v1/movie/movies/secured/personality/edit",

  // OMDB API ENDPOINTS
  OMDB_API_URL: "/api/v1/shared/app_management/public/omdb_data_search",
  OMDB_DETAIL_API_URL:
    "/api/v1/shared/app_management/public/omdb_movie_details",

  // VALIDATION API ENDPOINTS
  PLACE_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_place",
  COUNTRY_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_country",
  CATEGORY_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_category",
  SUB_CATEGORY_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_subcategory",
  VENUE_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_venue",
  TAX_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_tax",
  MULT_EVENT_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_multiple_event",
  TICKET_VALIDATE_URL: "/api/v1/shared/validation/secured/validate_ticket",
  OFFER_COUPON_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_offer_coupon",
  ADCATEGORY_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_ad_category",

  // FOOTER URLS

  FAQ_URL: "https://cdn-assets.ticket2me.app/faq/v1.0.0.json",
  BUCKET_URL:
    "https://de64063e3b101c4412b924b8c25193ae.r2.cloudflarestorage.com",
  BUCKET_NAME: "ticket2me-json",
  BUCKET_FAQ_KEY: "faq/v1.0.0.json",
  BUCKET_INFO_KEY: "info/v1.0.0.json",
  FAQ_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_faq",
  FAQ_GET_URL: "/api/v1/shared/app_management/public/get_faq",
  INFO_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_info",
  INFO_GET_URL: "/api/v1/shared/app_management/public/get_info",
  FOOTER_GET_URL: "/api/v1/shared/app_management/public/get_footer",
  FOOTER_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_footer",

  //Payment
  PAYMENT_URL: "/api/v1/shared/payment/secured/payment",
  PAYMENT_METHOD: "/api/v1/shared/payment/secured/payment/methods",

  // lead event list
  LEAD_EVENT_LIST: "/api/v1/event/events/secured/customer_event",
  SINGLE_CUSTOMER_LEAD_EVENT:
    "/api/v1/event/events/secured/single_customer_event",

  //seat api
  MOVIE_SEAT_URL: "/api/v1/movie/seats/secured/seatstructure",
  MOVIE_SEAT_EDIT_URL: "/api/v1/movie/seats/secured/seatstructure/edit",
  MOVIE_SEAT_STATUS_URL:
    "/api/v1/movie/seats/secured/seatstructure/edit/status",
  MOVIE_SEAT_DETAILS_URL: "/api/v1/movie/seats/secured/seatstructure/single",
  EVENT_SEAT_URL: "/api/v1/event/seats/secured/seatstructure",
  EVENT_SEAT_EDIT_URL: "/api/v1/event/seats/secured/seatstructure/edit",
  EVENT_SEAT_STATUS_URL:
    "/api/v1/event/seats/secured/seatstructure/edit/status",
  EVENT_SEAT_DETAILS_URL: "/api/v1/event/seats/secured/seatstructure/single",

  //movie schedule api
  MOVIE_SCHEDULE_URL: "/api/v1/movie/movies/secured/movie_schedules",
  MOVIE_SCHEDULE_DETAILS_URL:
    "/api/v1/movie/movies/secured/movie_schedules/single",
};
