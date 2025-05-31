import { PERMISSIONS, ROLES } from './RolesPermissionConstants';

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
    [ROLES.TECH_ADMIN]: [
        //event
        PERMISSIONS.ADD_EVENT,
        //venue
        PERMISSIONS.EDIT_VENUE,
    ],
    [ROLES.TECH_SUPPORT_TEAM]: [
        // PERMISSIONS.VIEW_EVENT_DETAILS,
        // PERMISSIONS.VIEW_CATEGORY,
        PERMISSIONS.VIEW_LOCATION,
        PERMISSIONS.VIEW_TAX,
        PERMISSIONS.VIEW_TICKET,
        PERMISSIONS.VIEW_OFFER,
    ],
    [ROLES.EVENT_ORGANIZER]: [
        PERMISSIONS.VIEW_EVENT_DETAILS,
        PERMISSIONS.EDIT_EVENT_DETAILS,
    ],
    [ROLES.EVENT_SUPPORT_TEAM]: [
        PERMISSIONS.VIEW_EVENT_DETAILS,
    ],
};

export const FORM_STEPS = {
    [ROLES.SUPER_ADMIN]: ["Event Details", "Category", "Location", "Tax", "Ticket", "Offers"],
    [ROLES.TECH_ADMIN]: ["Event Details", "Category", "Location", "Tax", "Ticket", "Offers"],
    [ROLES.EVENT_ORGANIZER]: ["Event Details"],
    [ROLES.EVENT_SUPPORT_TEAM]: ["Event Details"],
};

export const DEFAULT_ROUTES = {
    [ROLES.SUPER_ADMIN]: "/super-admin/reports",
    [ROLES.TECH_ADMIN]: "/super-admin/reports",
    [ROLES.TECH_SUPPORT_TEAM]: "/super-admin/reports",
    [ROLES.EVENT_ORGANIZER]: "/organizer/reports",
    [ROLES.EVENT_SUPPORT_TEAM]: "/organizer/reports",
};