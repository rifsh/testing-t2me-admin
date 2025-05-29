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
};

export const PERMISSIONS = {
    ADD_EVENT_TYPE: 'add_event_type',
    ADD_EVENT: 'add_event',
    VIEW_EVENT_DETAILS: 'view_event_details',
    VIEW_CATEGORY: 'view_category',
    VIEW_LOCATION: 'view_location',
    VIEW_TAX: 'view_tax',
    VIEW_TICKET: 'view_ticket',
    VIEW_OFFER: 'view_offer',
    EDIT_EVENT_DETAILS: 'edit_event_details',
    EDIT_CATEGORY: 'edit_category',
    EDIT_LOCATION: 'edit_location',
    EDIT_TAX: 'edit_tax',
    EDIT_TICKET: 'edit_ticket',
    EDIT_OFFER: 'edit_offer',
};