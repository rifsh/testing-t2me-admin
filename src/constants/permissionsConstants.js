import { PERMISSIONS, ROLES } from './RolesPermissionConstants';

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