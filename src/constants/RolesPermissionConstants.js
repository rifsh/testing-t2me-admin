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
    { id: 6, name: 'End User' },
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
    APPLICATIONS: {
        title: 'Application',
        SERVICES: {
            title: "Services",
            GENERAL: {
                title: "General",
                EVENT_TYPES: {
                    title: 'Event Type',
                    GET_EVENT_TYPE_OPTIONS: 'get_event_type_options',
                    GET_EVENT_TYPE: 'get_event_type',
                    ADD_EVENT_TYPE: 'add_event_type',
                    GET_EVENT_TYPE_DETAIL: 'get_event_type_detail',
                    EDIT_EVENT_TYPE_DETAIL: 'edit_event_type_detail',
                    UPDATE_EVENT_TYPE_STATUS: 'update_event_type_status',
                },
                PLACE: {
                    title: 'Place',
                    ADD_PLACE: 'add_place',
                    GET_PLACE: 'get_place',
                    EDIT_PLACE: 'edit_place',
                    EDIT_PLACE_STATUS: 'edit_place_status',
                    GET_SINGLE_PLACE: 'get_single_place',
                    GET_COUNTRY_DETAILS: 'get_country_details',
                    GET_PLACE_WITH_COUNTRY: 'get_place_with_country',
                },
                VENUE: {
                    title: 'Venue',
                    GET_VENUE: 'get_venue',
                    ADD_VENUE: 'add_venue',
                    EDIT_VENUE: 'edit_venue',
                    GET_SINGLE_VENUE: 'get_single_venue',
                    EDIT_VENUE_STATUS: 'edit_venue_status',
                },
                TAX: {
                    title: 'Tax',
                    GET_TAXES: 'get_taxes',
                    ADD_TAXES: 'add_taxes',
                    EDIT_TAXES: 'edit_taxes',
                    UPDATE_TAX_STATUS: 'update_tax_status',
                    GET_AVAILABLE_TAX_CATEGORY: 'get_available_tax_category',
                },
                CATEGORY: {
                    title: 'Category',
                    ADD_CATEGORY: 'add_category',
                    EDIT_CATEGORY: 'edit_category',
                    GET_CATEGORY: 'get_category',
                    UPDATE_CATEGORY_STATUS: 'update_category_status',
                    UPDATE_SUBCATEGORY_STATUS: 'update_subcategory_status',
                    GET_SINGLE_CATEGORY: 'get_single_category',
                    ADD_SUBCATEGORY: 'add_subcategory',
                    EDIT_SUBCATEGORY: 'edit_subcategory',
                    GET_SUBCATEGORY: 'get_subcategory',
                    GET_SINGLE_SUBCATEGORY: 'get_single_subcategory',
                },
                OFFER: {
                    title: 'Offer',
                    GET_OFFERS: 'get_offers',
                    ADD_OFFERS: 'add_offers',
                    ADD_ORGANIZER_OFFERS: 'add_organizer_offers',
                    EDIT_OFFERS: 'edit_offers',
                    EDIT_ORGANIZER_OFFERS: 'edit_offers',
                    UPDATE_OFFER_STATUS: 'update_offer_status',
                    GET_OFFER_DETAIL: 'get_offer_detail',
                },
                COUPON: {
                    title: 'Coupon',
                    ADD_COUPONS: 'add_coupons',
                    GET_COUPONS: 'get_coupons',
                    UPDATE_COUPON_STATUS: 'update_coupon_status',
                    GET_COUPON_DETAIL: 'get_coupon_detail',
                },
                SEAT: {
                    title: 'Seat',
                    // Add seat-related here as needed
                },
                PAYMENT: {
                    title: 'Payment',
                    GET_PAYMENT: 'get_payment',
                    GET_PAYMENT_DETAILS: 'get_single_payment',
                    ADD_PAYMENT: 'add_payment',
                    EDIT_PAYMENT: 'edit_payment',
                    GET_PAYMENT_METHODS: 'get_payment_method',
                }
            },
            EVENT: {
                title: 'Event',
                TICKET: {
                    title: 'Ticket',
                    ADD_TICKET: 'add_ticket_structure',
                    GET_TICKET: 'get_ticket_structure',
                    EDIT_TICKET_STRUCTURE: 'edit_ticket_structure',
                    VALIDATE_TICKET: 'validate_ticket'
                },
                SEAT: {
                    title: 'Seat',
                    GET_EVENT_SEAT_STRUCTURE: 'get_event_seat_structure',
                    GET_EVENT_SINGLE_SEAT_STRUCTURE: 'get_single_event_seat_structure',
                    ADD_EVENT_SEAT_STRUCTURE: 'add_event_seat_structure',
                    EDIT_EVENT_SEAT_STRUCTURE: 'edit_event_seat_structure',
                    EDIT_EVENT_SEAT_STRUCTURE_STATUS: 'edit_event_seat_structure_status',
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
                SCHEDULE: {
                    title: 'Schedule',
                    GET_AVAILABLE_SCHEDULE_TYPES: 'get_available_schedule_types',
                    GET_EVENT_SCHEDULES: 'get_event_schedules',
                    ADD_EVENT_SCHEDULES: 'add_event_schedules',
                    GET_EVENT_SCHEDULE_DETAILS: 'get_event_schedule_details',
                },
            },
            MOVIE: {
                title: 'Movie',
                THEATER_MODULE: {
                    title: 'Theater',
                    THEATER_COMPANY: {
                        ADD_THEATER_COMPANY: 'create_theater_company',
                        GET_THEATER_COMPANY_DETAILS: 'get_single_theater_company',
                        EDIT_THEATER_COMPANY: 'edit_theater_company',
                        EDIT_THEATER_COMPANY_STATUS: 'update_theater_company_status',
                    },
                    THEATER: {
                        ADD_THEATER: 'create_theater',
                        EDIT_THEATER: 'edit_theater',
                        EDIT_THEATER_STATUS: 'edit_theater_status',
                        GET_THEATER_LIST: 'get_theater_by_venue',
                        GET_ALL_THEATER: 'get_all_theaters',
                        GET_THEATER_DETAILS: 'get_single_theater',
                    }
                },
                SCREEN: {
                    title: 'Screen',
                    ADD_SCREEN: 'create_screen',
                    EDIT_SCREEN: 'edit_screen',
                    EDIT_SCREEN_STATUS: 'edit_screen_status',
                    GET_SCREEN: 'get_screens',
                    GET_SCREEN_DETAILS: 'get_single_screen',
                    ADD_SCREEN_TECH: 'add_screen_tech',
                    GET_SCREEN_TECH: 'get_screen_tech',
                    ADD_SCREEN_AUDIO: 'add_screen_audio',
                    GET_SCREEN_TECH: 'get_screen_audio',
                    ADD_SCREEN_FEATURES: 'add_screen_feature',
                    GET_SCREEN_FEATURES: 'get_screen_feature',
                },
                SEAT: {
                    title: 'Seat',
                    ADD_SEAT_STRUCTURE:'add_movie_seat_structure',
                    GET_MOVIE_SEAT_STRUCTURE:'get_movie_seat_structure',
                    GET_SIGNLE_MOVIE_SEAT_STRUCTURE:'get_single_movie_seat_structure',
                    EDIT_MOVIE_SEAT_STRUCTURE:'edit_movie_seat_structure',
                    EDIT_MOVIE_SEAT_STRUCTURE_STATUS:'edit_movie_seat_structure_status',
                    ADD_ORGANIZER_MOVIE_SEAT_STRUCTURE:'add_organizer_movie_seats',
                    EDIT_ORGANIZER_MOVIE_SEAT_STRUCTURE:'update_organizer_movie_seats',
                    GET_ORGANIZER_MOVIE_SEAT_STRUCTURE:'get_organizer_movie_seats',
                    GET_ORGANIZER_SINGLE_MOVIE_SEAT_STRUCTURE:'get_organizer_movie_seat_details',
                    ORGANIZER_MOVIE_SEAT_STRUCTURE_CHANGE:'organizer_movie_seat_changes',
                    APPROVE_ORGANIZER_MOVIE_SEAT_STRUCTURE_CHANGE:'approve_organizer_movie_seats',
                },
                PERSONALITY_PROFILE: {
                    title: 'Personality Profiles',
                    GET_PERSONALITY: 'get_movie_personality',
                    ADD_PERSONALITY: 'add_movie_personality',
                    EDIT_PERSONALITY: 'edit_movie_personality',
                    EDIT_PERSONALITY_STATUS: 'edit_movie_personality_status',
                    GET_PERSONALITY_DETAILS: 'get_single_movie_personality',
                },
                MOVIE: {
                    ADD_MOVIE: 'create_movie',
                    EDIT_MOVIE: 'edit_movie',
                    EDIT_MOVIE_STATUS: 'edit_movie_status',
                    GET_MOVIE: 'get_movie_list',
                    GET_MOVIE_DETAILS: 'get_single_movie',
                    GET_MOVIE_LANGUAGES: 'get_movie_languages',
                    GET_MOVIE_GENRES: 'get_movie_genres',
                },
                SCHEDULE: {
                    title: 'Schedule',
                    GET_MOVIE_SCHEDULES: 'get_movie_schedules',
                    ADD_MOVIE_SCHEDULES: 'add_movie_schedules',
                    GET_ORGANIZER_MOVIE_SCHEDULES: 'get_organizer_movie_schedules',
                    ADD_ORGANIZER_MOVIE_SCHEDULES: 'add_organizer_movie_schedules',
                    GET_ORGANIZER_MOVIE_SCHEDULE_DETAILS: 'get_organizer_movie_schedule_details',
                    APPROVE_ORGANIZER_MOVIE_SCHEDULE: 'approve_organizer_movie_schedule',
                }
            },
        },
        ISSUES: {
            title: 'Issues',
            ISSUE: {
                title: 'Issues',
                ADD_ISSUES: 'add_issue',
                GET_ISSUES: 'get_issues',
                GET_ISSUE_ASSIGN_DETAILS: 'get_issue_assign_details',
                GET_ISSUE_DETAILS: 'get_issue_details',
                UPDATE_ISSUE_STATUS: 'update_issue_status',
                CLOSE_ISSUE: 'close_issue',
                ASSIGN_ISSUE: 'assign_issue',
                ADD_ISSUE_COMMENT: 'add_issue_comment',
                GET_ISSUE_COMMENT: 'get_issue_comment',
                ADMIN_ISSUE_COMMENT: 'admin_issue_comment',

            },
            ISSUE_ALERT: {
                title: 'Alert',
                GET_ISSUE_ALERTS: 'get_issue_alerts',
                GET_ISSUE_ALERTS_DETAILS: 'get_single_issue_alerts',
            }
        },
        TRACK_REQUEST: {
            title: 'Track Request',
            EVENT: {
                title: 'Event Organiser updates',
                GET_SINGLE_EVENT_UPDATE: 'get_single_event_update',
                SUPER_ADMIN_APPROVAL: 'super_admin_approval',
                SUPER_ADMIN_UPDATE: 'super_admin_update',
                SUPER_ADMIN_REJECT: 'super_admin_reject',
                ORGANIZER_MAKE_CHANGES: 'organizer_make_changes',
            },
            MOVIE: {
                title: 'Movie',
                SEAT: {
                    title: 'Seat',
                    SUPER_ADMIN_APPROVAL: 'approve_organizer_movie_seats'
                },
                OFFER: {
                    title: 'Offer',
                    SUPER_ADMIN_APPROVAL: 'approve_organizer_offer'
                },
                COUPEN: {
                    title: 'Coupon',
                    SUPER_ADMIN_APPROVAL: 'approve_organizer_coupon'
                },
                SCHEDULE: {
                    title: 'Schedule',
                    SUPER_ADMIN_APPROVAL: 'approve_organizer_movie_schedule'
                }
            }
        },
        LEAD_EVENT_REQUEST: {
            title: 'Lead Event Request',
            EVENT_REQUEST_LIST: {
                title: 'Event Request List',
                ADD_LEAD_EVENT: 'lead_event_creation',
                EDIT_LEAD_EVENT: 'edit_lead_event',
                EDIT_LEAD_EVENT_STATUS: 'edit_lead_event_status',
                ENROLL_USER_LEAD_EVENT_STATUS: 'enroll_user_lead_event',
                GET_LEAD_EVENT: 'get_lead_events',
                GET_SINGLE_LEAD_EVENT: 'get_single_lead_event',
                ADD_LEAD_EVENT_COMMENT: 'add_lead_event_comment',
                GET_LEAD_EVENT_COMMENT: 'get_lead_event_comment',
            },
            ADD_LEAD_EVENT: 'lead_event_creation',
            EDIT_LEAD_EVENT: 'edit_lead_event',
            EDIT_LEAD_EVENT_STATUS: 'edit_lead_event_status',
            ENROLL_USER_LEAD_EVENT_STATUS: 'enroll_user_lead_event',
            GET_LEAD_EVENT: 'get_lead_events',
            GET_SINGLE_LEAD_EVENT: 'get_single_lead_event',
            ADD_LEAD_EVENT_COMMENT: 'add_lead_event_comment',
            GET_LEAD_EVENT_COMMENT: 'get_lead_event_comment',
        },
        ADVERTISEMENTS: {
            title: 'Advertisements',
            AD_CATEGORY: {
                title: 'Ad Schedule',

            },
            BANNERS: {
                title: 'Banners',

            },
            SCHEDULE: {
                title: 'Schedule',

            }
        },
        NEWS_LETTER: {
            title: 'News Letter',
            NEWS_LETTER: {
                title: 'News Letter',

            },
            SUBSCRIBERS: {
                title: 'Subsibers',

            }
        },
        USER: {
            title: 'User',
            USER: {
                ADD_USER: 'add_user',
                EDIT_USER: 'edit_user',
                EDIT_USER_STATUS: 'edit_user_status',
                GET_USER_DETAILS: 'get_single_user',
            },
            SYSTEM_PERMISSIONS: {
                title: 'System Permissions',
            }
        },
    },
    APP_MANAGEMENT: {
        title: 'App Management',
        LAYOUT: {
            title: 'Layout',
            FOOTER: {
                title: "Footer"
            },
            FAQ: {
                title: 'FAQ'
            },
            APP_INFO: {
                title: 'App Info'
            },
            TERMS_CONDITIONS: {
                title: 'Terms and Conditions'
            }
        },
    },
};