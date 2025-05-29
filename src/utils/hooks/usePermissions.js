import { getCurrentUser } from 'configs/UserAccessConfig';
import { DEFAULT_ROUTES, FORM_STEPS, ROLE_PERMISSIONS } from 'constants/permissionsConstants';

const usePermissions = () => {
    const currentUser = getCurrentUser();

    const permissions = useMemo(() => {
        const hasPermission = (permission) => {
            if (!currentUser) return false;
            const allowedPermissions = ROLE_PERMISSIONS[currentUser.role_id] || [];
            return allowedPermissions.includes(permission);
        };

        const getFormSteps = () => {
            return currentUser ? FORM_STEPS[currentUser.role_id] || [] : [];
        };

        const getAuthenticatedEntry = () => {
            const defaultRoute = currentUser ? DEFAULT_ROUTES[currentUser.role_id] : '/login';
            return `${APP_PREFIX_PATH}${defaultRoute}`;
        };

        return {
            hasPermission,
            getFormSteps,
            getAuthenticatedEntry,
            currentUser
        };
    }, [currentUser])
    return permissions;
}

export default usePermissions