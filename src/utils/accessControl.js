import { APP_PREFIX_PATH } from "configs/AppConfig";
import { getCurrentUser } from "configs/UserAccessConfig";
import { DEFAULT_ROUTES, FORM_STEPS, ROLE_PERMISSIONS } from "constants/permissionsConstants";

export const hasPermission = (permission) => {
    const user = getCurrentUser();
    if (!user) return false;

    const allowedPermissions = ROLE_PERMISSIONS[user.role_id] || [];
    return allowedPermissions.includes(permission);
};

export const getFormSteps = () => {
    const user = getCurrentUser();
    return user ? FORM_STEPS[user.role_id] || [] : [];
};

export const getAuthenticatedEntry = () => {
    const user = getCurrentUser();
    const defaultRoute = user ? DEFAULT_ROUTES[user.role_id] : '/login';
    return `${APP_PREFIX_PATH}${defaultRoute}`;
};