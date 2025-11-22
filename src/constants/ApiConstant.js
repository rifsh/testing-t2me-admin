export const ApiConstant = {
  API_BASE_URL: "https://uat-tickets2me.mitetechnology.com",
  TENANT_COUNTRY_URL: "/api/v1/location/public/tenant/country",
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
  USER_DETAILS_URL: "/api/v1/shared/auth/secured/user/details",
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
  CHECK_EVENT_EDIT_URL: "/api/v1/event/events/secured/event/edit/check",
  EVENT_TYPE_OPTION_URL: "/api/v1/shared/event_type/secured/event_type/options",
  EVENT_TYPE_URL: "/api/v1/shared/event_type/secured/event_type",
  EVENT_TYPE_DETAILS_URL: "/api/v1/shared/event_type/secured/event_type/detail",
  EVENT_TYPE_STATUS_URL: "/api/v1/shared/event_type/secured/event_type/status",
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
  COUPON_CODE_GENERATE_URL: "/api/v1/shared/offers/secured/coupons/generate-unique-codes",
  COUPON_STATUS_URL: "/api/v1/shared/offers/secured/coupons_status",
  COUPON_DETAILS_URL: "/api/v1/shared/offers/secured/coupons/detail",
  ORGANIZER_OFFER_URL: "/api/v1/shared/offers/secured/offers/organizer",
  ORGANIZER_OFFER_MAKE_CHANGES_URL:
    "/api/v1/shared/offers/secured/offers/organizer/make_changes",
  ORGANIZER_TICKET_MAKE_CHANGES_URL:
    "/api/v1/event/tickets/secured/ticketstructure/organizer/make_changes",
  ORGANIZER_OFFER_STATUS_URL:
    "/api/v1/shared/offers/secured/offers_status/organizer",
  ORGANIZER_OFFER_APPROVAL_URL:
    "/api/v1/shared/offers/secured/offers/organizer/approval",
  ORGANIZER_TICKET_APPROVAL_URL:
    "/api/v1/event/tickets/secured/ticketstructure/organizer/approval",
  ORGANIZER_OFFER_DETAIL_URL:
    "/api/v1/shared/offers/secured/offers/organizer/detail",
  ORGANIZER_TICKET_DETAIL_URL:
    "/api/v1/event/tickets/secured/single_ticketstructure/organizer",

  ORGANIZER_COUPON_URL: "/api/v1/shared/offers/secured/coupons/organizer",
  ORGANIZER_COUPON_MAKE_CHANGES_URL:
    "/api/v1/shared/offers/secured/coupons/organizer/make_changes",
  ORGANIZER_COUPON_UPDATE_URL:
    "/api/v1/shared/offers/secured/coupons/organizer/update",
  ORGANIZER_COUPON_STATUS_URL:
    "/api/v1/shared/offers/secured/coupons_status/organizer",
  ORGANIZER_COUPON_DETAILS_URL:
    "/api/v1/shared/offers/secured/coupons/organizer/detail",
  ORGANIZER_COUPON_APPROVAL_URL:
    "/api/v1/shared/offers/secured/coupons/organizer/approval",

  TAX_URL: "/api/v1/location/secured/taxes",
  TAX_STATUS_URL: "/api/v1/location/secured/taxes_status",
  AVAILABLE_TAX_CATEGORY_URL: "/api/v1/location/secured/available_tax_category",
  TICKET_URL: "/api/v1/event/tickets/secured/ticketstructure",
  EVENT_ORGANIZER_TICKET_URL: "/api/v1/event/tickets/secured/ticketstructure/organizer",
  AVAILABLE_TICKET_TYPE_URL: "/api/v1/event/schedule/secured/available_types",
  SCHEDULE_URL: "/api/v1/event/schedule/secured/schedules",
  EDIT_SCHEDULE_URL: "/api/v2/event/schedule/secured/schedules/",
  SINGLE_SCHEDULE_URL: "/api/v1/event/schedule/secured/schedules/details",
  CHECK_SCHEDULE_EDIT_URL:
    "/api/v1/event/schedule/secured/schedules/edit/check",
  SCHEDULE_STATUS_EDIT_URL:
    "/api/v1/event/schedule/secured/schedules/status_change",
  STATICS_EVENT_LIST: "/api/v1/shared/statics/secured/events",
  STATICS_USER_LIST: "/api/v1/shared/statics/secured/users",
  STATICS_SCHEDULES_LIST: "/api/v1/shared/statics/secured/schedules",
  ISSUE_LIST_URL: "/api/v1/shared/issue/secured/issues",
  ISSUE_ALERT_LIST_URL: "/api/v1/shared/issue/secured/issues/alert",
  ISSUE_CREATION_URL: "/api/v1/shared/issue/secured/issues",
  TICKET_ASSIGN_DETAILS_URL:
    "/api/v1/shared/issue/secured/issues/assign/details",
  ISSUE_DETAILS_URL: "/api/v1/shared/issue/secured/issues/details",
  ISSUE_STATUS_UPDATE_URL: "/api/v1/shared/issue/secured/issues/status",
  ISSUE_CLOSE_URL: "/api/v1/shared/issue/secured/issues/close",
  ISSUE_REASSIGN_URL: "/api/v1/shared/issue/secured/issues/assign",
  ISSUE_REASSIGN_COMMENT_URL: "/api/v1/shared/issue/secured/issues/comment",
  ADMIN_COMMENT_URL: "/api/v1/shared/issue/secured/issues/comment/admin",

  // Permissions
  GET_PERSMISSIONS: "/api/v1/shared/permission/secured/permissions",
  GET_PERSMISSIONS_DISPLAY_NAMES:
    "/api/v1/shared/permission/secured/permissions/names",
  ADD_PERSMISSIONS_ACCESS:
    "/api/v1/shared/permission/secured/permissions/update",

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
  EVENT_ORGANIZER_THEATER: "/api/v1/shared/auth/secured/users/related_entries",

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
  GET_ALL_SCREEN_TRACK_REQUEST_URL: "/api/v1/movie/movies/secured/screens",
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
  CHECK_TICKET_EDIT_URL:
    "/api/v1/event/tickets/secured/ticketstructure/edit/check",
  OFFER_COUPON_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_offer_coupon",
  ADCATEGORY_VALIDATE_URL:
    "/api/v1/shared/validation/secured/validate_ad_category",
  OFFER_AVAILABLE_DAYS_URL: "/api/v1/shared/offers/secured/offers/weekdays",

  // FOOTER URLS

  FAQ_URL: "https://cdn-assets.ticket2me.app/faq/v1.0.0.json",
  BUCKET_URL:
    "https://de64063e3b101c4412b924b8c25193ae.r2.cloudflarestorage.com",
  BUCKET_NAME: "ticket2me-json",
  BUCKET_FAQ_KEY: "/faq/v1.0.0.json",
  BUCKET_TERMS_KEY: "/terms/v1.0.0.json",
  BUCKET_INFO_KEY: "/info/v1.0.0.json",
  BUCKET_FOOTER_KEY: "/footer/v1.0.0.json",
  FAQ_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_faq",
  FAQ_GET_URL: "/api/v1/shared/app_management/public/get_faq",
  INFO_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_info",
  INFO_GET_URL: "/api/v1/shared/app_management/public/get_info",
  FOOTER_GET_URL: "/api/v1/shared/app_management/public/get_footer",
  FOOTER_UPLOAD_URL: "/api/v1/shared/app_management/secured/upload_footer",
  GENERATE_PRESIGNED_URL_LAYOUT_JSON:
    "/api/v1/shared/app_management/public/generate_presigned_url",
  GENERATE_PRESIGNED_MEDIA_URL:
    "/api/v1/shared/app_management/public/generate_presigned_media_url",

  //Payment
  PAYMENT_URL: "/api/v1/shared/payment/secured/payment",
  SINGLE_PAYMENT_URL: "/api/v1/shared/payment/secured/payment/single/details",
  PAYMENT_METHOD: "/api/v1/shared/payment/secured/payment/methods",
  PAYMENT_ADD_ON_SERVICE: "/api/v1/event/add_on/secured/add_on_master",
  PAYMENT_SERVICE: "/api/v1/shared/payment/secured/payment/services",

  // lead event list
  LEAD_EVENT_LIST: "/api/v1/event/events/secured/customer_event",
  SINGLE_CUSTOMER_LEAD_EVENT:
    "/api/v1/event/events/secured/single_customer_event",

  //seat api
  MOVIE_SEAT_URL: "/api/v1/movie/seats/secured/seatstructure",
  MOVIE_SEAT_EDIT_URL: "/api/v1/movie/seats/secured/seatstructure/edit",
  MOVIE_SEAT_MAKE_EDIT_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer/make_changes",
  MOVIE_SEAT_STATUS_URL:
    "/api/v1/movie/seats/secured/seatstructure/edit/status",
  MOVIE_SEAT_DETAILS_URL: "/api/v1/movie/seats/secured/seatstructure/single",
  EVENT_SEAT_URL: "/api/v1/event/seats/secured/seatstructure",
  ORGANIZER_EVENT_SEAT_URL: "/api/v1/event/seats/secured/seatstructure/organizer",
  EVENT_SEAT_EDIT_URL: "/api/v1/event/seats/secured/seatstructure/edit",
  EVENT_SEAT_STATUS_URL:
    "/api/v1/event/seats/secured/seatstructure/edit/status",
  EVENT_SEAT_DETAILS_URL: "/api/v1/event/seats/secured/seatstructure/single",
  MOVIE_ORGANIZER_SEAT_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer",
  MOVIE_ORGANIZER_SEAT_EDIT_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer/update",
  MOVIE_ORGANIZER_SEAT_STATUS_LIST_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer",
  MOVIE_ORGANIZER_SEAT_STATUS_DETAILS_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer/details",
  ORGANIZER_MOVIE_SEAT_APPROVAL_URL:
    "/api/v1/movie/seats/secured/seatstructure/organizer/approval",

  //movie schedule api
  // MOVIE_SCHEDULE_URL: "/api/v1/movie/movies/secured/movie_schedules",
  // ADD_MOVIE_SCHEDULE_URL: "/api/v1/movie/schedule/secured/movie_schedules",
  MOVIE_SCHEDULE_URL: "/api/v1/movie/schedule/secured/movie_schedules",
  MOVIE_ORGANIZER_SCHEDULE_URL:
    "/api/v1/movie/schedule/secured/schedules/organizer",
  MOVIE_ORGANIZER_SCHEDULE_DETAIL_URL:
    "/api/v1/movie/schedule/secured/schedules/organizer/details",
  ORGANIZER_MOVIE_SCHEDULE_APPROVAL_URL:
    "/api/v1/movie/schedule/secured/schedules/organizer/approval",
  // MOVIE_SCHEDULE_DETAILS_URL:"/api/v1/movie/movies/secured/movie_schedules/single",
  MOVIE_SCHEDULE_DETAILS_URL:
    "/api/v1/movie/schedule/secured/movie_schedules/single",

  //report based apis
  ADMIN_REPORT: "/api/v1/shared/report/secured/summary_report_static",
  REPORT_USERS: "/api/v1/shared/report/secured/report_user_list",
  REPORT_USER_DETAIL: "/api/v1/shared/report/secured/event/report_user_details",
  REPORT_EVENT_DETAIL: "/api/v1/shared/report/secured/event_report_details",
  REPORT_USER_DETAIL_MOVIES:
    "/api/v1/shared/report/secured/movies/report_user_details",
  REPORT_THEATER_DETAIL: "/api/v1/shared/report/secured/movie/theatre_details",
  REPORT_COUNTRY_LIST: "/api/v1/shared/report/secured/report_country/list",
  REPORT_MOVIE_DETAIL:
    "/api/v1/shared/report/secured/movie/movie_details_by_theatre",
  REPORT_USER_THEATERS: "/api/v1/shared/report/secured/report/users_theaters",
  REPORT_EVENT_LISTING: "/api/v1/shared/report/secured/report/users_events",
  REPORT_EXPORTS: "/api/v1/shared/report/secured/stats/position-5/monthly",
  REPORT_MOVIE_LISTING: "/api/v1/shared/report/secured/report/theatre_movies",

  //Orders
  EVENT_ORDERS_LIST: "/api/v1/event/orders/secured/schedule/list",
  EVENT_ORDERS_SUMMARY: "/api/v1/event/orders/secured/schedule/summary/status",
  EVENT_ORDERS_DETAILS_DATE:
    "/api/v1/event/orders/secured/schedule/show/date/details",
  EVENT_ORDERS_DETAILS_TIME:
    "/api/v1/event/orders/secured/schedule/show/time/details",
  MOVIE_ORDERS_LIST: "/api/v1/movie/orders/secured/schedule/list",
  MOVIE_ORDERS_SUMMARY: "/api/v1/movie/orders/secured/schedule/summary/status",
  MOVIE_ORDERS_DETAILS_DATE:
    "/api/v1/movie/orders/secured/schedule/show/date/details",
  MOVIE_ORDERS_DETAILS_TIME:
    "/api/v1/movie/orders/secured/schedule/show/time/details",
  BOOKING_LIST: "/api/v1/event/orders/secured/orders/list",
  BOOKING_DETAILS: "/api/v1/event/orders/secured/orders/details",

  //activity
  ACTIVITY_LOGGER_URL: "/api/v1/shared/batch/secured/activity/log",
  //apscheduler
  APSCHEDULER_LOGGER_URL: "/api/v1/shared/scheduler/secured/activity/log",

  //addon-qr-validations
  USER_LIST:
    "/api/v1/event/add_on/secured/scan/event/booking_ticket/addon_user_and_food/user",
  CONSUME_USER_LIST:
    "/api/v1/event/add_on/secured/authorize/event/booking_ticket/addon_user_and_food/user",
  ADDON_LIST:
    "/api/v1/event/add_on/secured/scan/event/booking_ticket/addon_user_and_food/food",
  CONSUME_ADDON_LIST:
    "/api/v1/event/add_on/secured/authorize/event/booking_ticket/addon_user_and_food/food",

  //Event-booking-verification
  EVENT_TICKET_BOOKNG_VERIFICATION:
    "/api/v1/event/booking/ticket/public/booking/scan/verify",
  EVENT_SINGLE_TICKET: "/api/v1/event/tickets/secured/single_ticketstructure",
  EVENT_SEAT_BOOKNG_VERIFICATION:
    "/api/v1/event/booking/seat/public/booking/scan/verify",
  MOVIE_BOOKNG_VERIFICATION:
    "/api/v1/movie/booking/public/theatre/booking/scan/verify",

  //S3 Related items
  S3_IMAGE_DELETE: "/api/v1/location/secured/media/delete",
};
