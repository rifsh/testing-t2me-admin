export const ROLES = {
    SUPER_ADMIN: 1,
    TECH_ADMIN: 2,
    TECH_SUPPORT_TEAM: 3,
    EVENT_SUPPORT_TEAM: 4,
    EVENT_ORGANIZER: 5,
    END_USER: 6,
};

export const ROLE_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.TECH_ADMIN]: 'Tech Admin',
    [ROLES.TECH_SUPPORT_TEAM]: 'Tech Support Team',
    [ROLES.EVENT_ORGANIZER]: 'Event Organizer',
    [ROLES.EVENT_SUPPORT_TEAM]: 'Event Support Team',
    [ROLES.END_USER]: 'Client user',
};

export const ROLE_NAMES_ARRAY = [
    { id: 1, name: 'Super Admin' },
    { id: 2, name: 'Tech Admin' },
    { id: 3, name: 'Tech Support Team' },
    { id: 4, name: 'Event Support Team' },
    { id: 5, name: 'Event Organizer' },
    // { id: 6, name: 'End User' },
];

export const ROLE_METHODS = [
    { id: 1, value: '', name: 'All' },
    { id: 2, value: 'get', name: 'GET' },
    { id: 3, value: 'post', name: 'POST' },
    { id: 4, value: 'delete', name: 'DELETE' },
    { id: 5, value: 'put', name: 'PUT' },
];

export const PERMISSIONS = {
    // Auth Module
    AUTH: {
        LOGOUT: 'logout',
        GET_USERS: 'get_users',
        UPDATE_USER_STATUS: 'update_user_status',
        GET_SINGLE_USER: 'get_single_user',
        REGISTER_USER: 'register_user',
        GET_ROLES: 'get_roles',
        GET_USER_RELATED_ENTRIES: 'get_user_related_entries',
    },
    SERVICES: {
        GENERAL: {
            EVENT_TYPES: {
                GET_EVENT_TYPE_OPTIONS: 'get_event_type_options',
                GET_EVENT_TYPE: 'get_event_type',
                ADD_EVENT_TYPE: 'add_event_type',
                GET_EVENT_TYPE_DETAIL: 'get_event_type_detail',
                EDIT_EVENT_TYPE_DETAIL: 'edit_event_type_detail',
                UPDATE_EVENT_TYPE_STATUS: 'update_event_type_status',
            },
            PLACE: {
                ADD_PLACE: 'add_place',
                GET_PLACE: 'get_place',
                EDIT_PLACE: 'edit_place',
                EDIT_PLACE_STATUS: 'edit_place_status',
                GET_SINGLE_PLACE: 'get_single_place',
                GET_COUNTRY_DETAILS: 'get_country_details',
                GET_PLACE_WITH_COUNTRY: 'get_place_with_country',
            },
            VENUE: {
                GET_VENUE: 'get_venue',
                ADD_VENUE: 'add_venue',
                EDIT_VENUE: 'edit_venue',
                GET_SINGLE_VENUE: 'get_single_venue',
                EDIT_VENUE_STATUS: 'edit_venue_status',
            },
            TAX: {
                GET_TAXES: 'get_taxes',
                ADD_TAXES: 'add_taxes',
                EDIT_TAXES: 'edit_taxes',
                UPDATE_TAX_STATUS: 'update_tax_status',
                GET_AVAILABLE_TAX_CATEGORY: 'get_available_tax_category',
            },
            CATEGORY: {
                ADD_CATEGORY: 'add_category',
                GET_CATEGORY: 'get_category',
                UPDATE_CATEGORY_STATUS: 'update_category_status',
                UPDATE_SUBCATEGORY_STATUS: 'update_subcategory_status',
                GET_SINGLE_CATEGORY: 'get_single_category',
                ADD_SUBCATEGORY: 'add_subcategory',
                GET_SUBCATEGORY: 'get_subcategory',
                GET_SINGLE_SUBCATEGORY: 'get_single_subcategory',
            },
            OFFER: {
                GET_OFFERS: 'get_offers',
                ADD_OFFERS: 'add_offers',
                UPDATE_OFFER_STATUS: 'update_offer_status',
                GET_OFFER_DETAIL: 'get_offer_detail',
            },
            COUPON: {
                ADD_COUPONS: 'add_coupons',
                GET_COUPONS: 'get_coupons',
                UPDATE_COUPON_STATUS: 'update_coupon_status',
                GET_COUPON_DETAIL: 'get_coupon_detail',
            },
            TICKET: {

            },
            SEAT: {

            },
            PAYMENT: {

            }
        },
        EVENT: {
            ADD_EVENT: 'add_event',
            GET_EVENT: 'get_event',
            LEAD_EVENT_CREATION: 'lead_event_creation',
            GET_LEAD_EVENTS: 'get_lead_events',
            VALIDATE_EVENT: 'validate_event',
            GET_EVENT_DETAIL: 'get_event_detail',
            GET_SINGLE_LEAD_EVENT: 'get_single_lead_event',
            GET_LEAD_EVENT_COMMENT: 'get_lead_event_comment',
            ADD_LEAD_EVENT_COMMENT: 'add_lead_event_comment',
            GET_EVENT_ORGANIZER: 'get_event_organizer',
            GET_EVENT_SUPPORT: 'get_event_support',
            EDIT_EVENT: 'edit_event',
            EDIT_LEAD_EVENT: 'edit_lead_event',
            ENROLL_USER_LEAD_EVENT: 'enroll_user_lead_event',
            EDIT_LEAD_EVENT_STATUS: 'edit_lead_event_status',
            EDIT_EVENT_STATUS: 'edit_event_status',
            GET_NEW_EVENT_UPDATES: 'get_new_event_updates',
            GET_SINGLE_EVENT_UPDATE: 'get_single_event_update',
            SUPER_ADMIN_APPROVAL: 'super_admin_approval',
            ORGANIZER_EVENT_UPDATE: 'organizer_event_update',
            ORGANIZER_EVENT_SECONDARY_UPDATE: 'organizer_event_secondary_update',
            GET_CUSTOMER_EVENT: 'get_customer_event',
            ADD_CUSTOMER_EVENT: 'add_customer_event',
            GET_SINGLE_CUSTOMER_EVENT: 'get_single_customer_event',
        },
        MOVIE: {

        },
    },
    ISSUES: {

    },
    TRACK_REQUEST: {
        EVENT: {

        },
        MOVIE: {

        }
    },

    LEAD_EVENT_REQUEST: {

    },
    ADVERTISEMENTS: {

    },
    NEWS_LETTER: {

    },
    USER: {

    },
    LAYOUT: {

    },
    // AppManagement Module
    UPDATE_TERMS_CONDITION: 'update_terms_condition',
    UPLOAD_FAQ: 'upload_faq',
    UPLOAD_INFO: 'upload_info',
    UPLOAD_FOOTER: 'upload_footer',

    // Offers Module


    GET_ORGANIZER_OFFERS: 'get_organizer_offers',
    ADD_ORGANIZER_OFFERS: 'add_organizer_offers',
    APPROVE_ORGANIZER_OFFER: 'approve_organizer_offer',
    GET_ORGANIZER_OFFER_DETAIL: 'get_organizer_offer_detail',
    ADD_ORGANIZER_COUPONS: 'add_organizer_coupons',
    GET_ORGANIZER_COUPONS: 'get_organizer_coupons',
    GET_ORGANIZER_COUPON_DETAIL: 'get_organizer_coupon_detail',
    APPROVE_ORGANIZER_COUPON: 'approve_organizer_coupon',
    MAKE_ORGANIZER_OFFER_CHANGES: 'make_organizer_offer_changes',
    MAKE_ORGANIZER_COUPON_CHANGES: 'make_organizer_coupon_changes',
    UPDATE_ORGANIZER_COUPON: 'update_organizer_coupon',

    // Tickets Module
    GET_TICKET_STRUCTURE: 'get_ticket_structure',
    ADD_TICKET_STRUCTURE: 'add_ticket_structure',
    EDIT_TICKET_STRUCTURE: 'edit_ticket_structure',

    // Event_Schedule Module
    GET_AVAILABLE_SCHEDULE_TYPES: 'get_available_schedule_types',
    GET_EVENT_SCHEDULES: 'get_event_schedules',
    ADD_EVENT_SCHEDULES: 'add_event_schedules',
    GET_EVENT_SCHEDULE_DETAILS: 'get_event_schedule_details',

    // Statics Module
    GET_EVENT_STATISTICS: 'get_event_statistics',
    GET_USER_STATISTICS: 'get_user_statistics',
    GET_SCHEDULE_STATISTICS: 'get_schedule_statistics',

    // Issue Module
    GET_ISSUES: 'get_issues',
    GET_ISSUE_ALERTS: 'get_issue_alerts',
    GET_ISSUE_ASSIGN_DETAILS: 'get_issue_assign_details',
    GET_ISSUE_DETAILS: 'get_issue_details',
    UPDATE_ISSUE_STATUS: 'update_issue_status',
    CLOSE_ISSUE: 'close_issue',
    ASSIGN_ISSUE: 'assign_issue',
    ADD_ISSUE_COMMENT: 'add_issue_comment',
    GET_ISSUE_COMMENT: 'get_issue_comment',
    ADMIN_ISSUE_COMMENT: 'admin_issue_comment',

    // Banners Module
    GET_BANNER_CATEGORY: 'get_banner_category',
    ADD_BANNER_CATEGORY: 'add_banner_category',
    GET_ADVERTISEMENT_BANNER: 'get_advertisement_banner',
    ADD_ADVERTISEMENT_BANNER: 'add_advertisement_banner',
    GET_ADVERTISEMENT_SCHEDULE: 'get_advertisement_schedule',
    ADD_ADVERTISEMENT_SCHEDULE: 'add_advertisement_schedule',
    UPDATE_AD_SCHEDULE: 'update_ad_schedule',
    GET_SINGLE_AD_SCHEDULE: 'get_single_ad_schedule',
    UPDATE_ADVERTISEMENT_BANNER: 'update_advertisement_banner',
    UPDATE_ADVERTISEMENT_BANNER_STATUS: 'update_advertisement_banner_status',
    UPDATE_BANNER_CATEGORY: 'update_banner_category',
    UPDATE_BANNER_CATEGORY_STATUS: 'update_banner_category_status',
    GET_CATEGORY_BANNERS: 'get_category_banners',
    UPDATE_SCHEDULE_BANNER_STATUS: 'update_schedule_banner_status',

    // Theater Module
    CREATE_THEATER: 'create_theater',
    EDIT_THEATER: 'edit_theater',
    EDIT_THEATER_STATUS: 'edit_theater_status',
    GET_THEATER_BY_VENUE: 'get_theater_by_venue',
    GET_ALL_THEATERS: 'get_all_theaters',
    GET_SINGLE_THEATER: 'get_single_theater',

    // TheaterCompany Module
    CREATE_THEATER_COMPANY: 'create_theater_company',
    EDIT_THEATER_COMPANY: 'edit_theater_company',
    UPDATE_THEATER_COMPANY_STATUS: 'update_theater_company_status',
    GET_ALL_THEATER_COMPANIES: 'get_all_theater_companies',
    GET_SINGLE_THEATER_COMPANY: 'get_single_theater_company',

    // Screens Module
    CREATE_SCREEN: 'create_screen',
    EDIT_SCREEN: 'edit_screen',
    EDIT_SCREEN_STATUS: 'edit_screen_status',
    GET_SCREENS: 'get_screens',
    GET_SINGLE_SCREEN: 'get_single_screen',
    ADD_SCREEN_TECH: 'add_screen_tech',
    GET_SCREEN_TECH: 'get_screen_tech',
    GET_SCREEN_AUDIO: 'get_screen_audio',
    ADD_SCREEN_AUDIO: 'add_screen_audio',
    GET_SCREEN_FEATURE: 'get_screen_feature',
    ADD_SCREEN_FEATURE: 'add_screen_feature',

    // Movies Module
    CREATE_MOVIE: 'create_movie',
    GET_MOVIE_LIST: 'get_movie_list',
    GET_SINGLE_MOVIE: 'get_single_movie',
    EDIT_MOVIE_STATUS: 'edit_movie_status',
    EDIT_MOVIE: 'edit_movie',
    GET_MOVIE_LANGUAGES: 'get_movie_languages',
    GET_MOVIE_GENRES: 'get_movie_genres',
    GET_MOVIE_PERSONALITY: 'get_movie_personality',
    ADD_MOVIE_PERSONALITY: 'add_movie_personality',
    GET_SINGLE_MOVIE_PERSONALITY: 'get_single_movie_personality',
    EDIT_MOVIE_PERSONALITY_STATUS: 'edit_movie_personality_status',
    EDIT_MOVIE_PERSONALITY: 'edit_movie_personality',

    // Validation Module
    VALIDATE_PLACE: 'validate_place',
    VALIDATE_COUNTRY: 'validate_country',
    VALIDATE_CATEGORY: 'validate_category',
    VALIDATE_SUBCATEGORY: 'validate_subcategory',
    VALIDATE_VENUE: 'validate_venue',
    VALIDATE_TAX: 'validate_tax',
    VALIDATE_MULTIPLE_EVENT: 'validate_multiple_event',
    VALIDATE_TICKET: 'validate_ticket',
    VALIDATE_OFFER_COUPON: 'validate_offer_coupon',
    VALIDATE_AD_CATEGORY: 'validate_ad_category',

    // Payment Module
    GET_PAYMENT: 'get_payment',
    ADD_PAYMENT: 'add_payment',
    EDIT_PAYMENT: 'edit_payment',
    GET_PAYMENT_METHODS: 'get_payment_methods',

    // Movie_Seats Module
    ADD_MOVIE_SEAT_STRUCTURE: 'add_movie_seat_structure',
    GET_MOVIE_SEAT_STRUCTURE: 'get_movie_seat_structure',
    EDIT_MOVIE_SEAT_STRUCTURE: 'edit_movie_seat_structure',
    ORGANIZER_MOVIE_SEAT_CHANGES: 'organizer_movie_seat_changes',
    EDIT_MOVIE_SEAT_STRUCTURE_STATUS: 'edit_movie_seat_structure_status',
    GET_SINGLE_MOVIE_SEAT_STRUCTURE: 'get_single_movie_seat_structure',
    GET_ORGANIZER_MOVIE_SEATS: 'get_organizer_movie_seats',
    ADD_ORGANIZER_MOVIE_SEATS: 'add_organizer_movie_seats',
    UPDATE_ORGANIZER_MOVIE_SEATS: 'update_organizer_movie_seats',
    GET_ORGANIZER_MOVIE_SEAT_DETAILS: 'get_organizer_movie_seat_details',
    APPROVE_ORGANIZER_MOVIE_SEATS: 'approve_organizer_movie_seats',

    // Event_Seats Module
    GET_EVENT_SEAT_STRUCTURE: 'get_event_seat_structure',
    ADD_EVENT_SEAT_STRUCTURE: 'add_event_seat_structure',
    EDIT_EVENT_SEAT_STRUCTURE: 'edit_event_seat_structure',
    EDIT_EVENT_SEAT_STRUCTURE_STATUS: 'edit_event_seat_structure_status',
    GET_SINGLE_EVENT_SEAT_STRUCTURE: 'get_single_event_seat_structure',

    // Movie_Schedule Module
    GET_MOVIE_SCHEDULES: 'get_movie_schedules',
    ADD_MOVIE_SCHEDULES: 'add_movie_schedules',
    GET_ORGANIZER_MOVIE_SCHEDULES: 'get_organizer_movie_schedules',
    ADD_ORGANIZER_MOVIE_SCHEDULES: 'add_organizer_movie_schedules',
    GET_ORGANIZER_MOVIE_SCHEDULE_DETAILS: 'get_organizer_movie_schedule_details',
    APPROVE_ORGANIZER_MOVIE_SCHEDULE: 'approve_organizer_movie_schedule',

    // Report Module
    GET_SUMMARY_REPORT_STATIC: 'get_summary_report_static',
    GET_REPORT_USER_LIST: 'get_report_user_list',
    GET_EVENT_REPORT_USER_DETAILS: 'get_event_report_user_details',
    GET_EVENT_REPORT_DETAILS: 'get_event_report_details',
    GET_MOVIE_REPORT_USER_DETAILS: 'get_movie_report_user_details',
    GET_MOVIE_THEATER_DETAILS: 'get_movie_theater_details',
    GET_REPORT_COUNTRY_LIST: 'get_report_country_list',
    GET_MOVIE_DETAILS_BY_THEATER: 'get_movie_details_by_theater',
    GET_USERS_THEATERS_REPORT: 'get_users_theaters_report',
    GET_USERS_EVENTS_REPORT: 'get_users_events_report',
    GET_MONTHLY_POSITION_STATS: 'get_monthly_position_stats',
    GET_THEATRE_MOVIES_REPORT: 'get_theatre_movies_report'
};