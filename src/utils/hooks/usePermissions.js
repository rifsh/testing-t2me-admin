import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { getCurrentUser } from 'configs/UserAccessConfig';
import { DEFAULT_ROUTES, FORM_STEPS } from 'constants/permissionsConstants';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const usePermissions = () => {
    const currentUser = getCurrentUser();
    const { allowedAccess } = useSelector((state) => state.auth);

    const permissions = useMemo(() => {
        /**
         * Checks if the user has a specific permission
         * @param {string} permissionCode - The codename of the permission to check
         * @returns {boolean} - Whether the user has the permission
         */
        const hasPermission = (permissionCode) => {
            // Super Admin (role_id === 1) has all permissions
            if (currentUser?.role_id === 1) return true;

            if (!currentUser || !Array.isArray(allowedAccess)) return false;

            return allowedAccess.some(
                (permission) => permission.codename === permissionCode
            );
        };

        /**
         * Checks if the user has any of the specified permissions
         * @param {string[]} permissionCodes - Array of permission codenames to check
         * @returns {boolean} - Whether the user has at least one of the permissions
         */
        const hasAnyPermission = (permissionCodes) => {
            // Super Admin (role_id === 1) has all permissions
            if (currentUser?.role_id === 1) return true;

            if (!currentUser || !Array.isArray(allowedAccess)) return false;

            return allowedAccess.some(
                (permission) => permissionCodes.includes(permission.codename)
            );
        };

        /**
         * Checks if the user has all of the specified permissions
         * @param {string[]} permissionCodes - Array of permission codenames to check
         * @returns {boolean} - Whether the user has all of the permissions
         */
        const hasAllPermissions = (permissionCodes) => {
            // Super Admin (role_id === 1) has all permissions
            if (currentUser?.role_id === 1) return true;

            if (!currentUser || !Array.isArray(allowedAccess)) return false;

            return permissionCodes.every(code =>
                allowedAccess.some(permission => permission.codename === code)
            );
        };

        /**
         * Gets the form steps available for the current user's role
         * @returns {array} - Array of form steps
         */
        const getFormSteps = () => {
            return currentUser ? FORM_STEPS[currentUser.role_id] || [] : [];
        };

        /**
         * Gets the authenticated entry path based on user role
         * @returns {string} - The route path
         */
        const getAuthenticatedEntry = () => {
            const defaultRoute = currentUser ? DEFAULT_ROUTES[currentUser.role_id] : '/login';
            return `${APP_PREFIX_PATH}${defaultRoute}`;
        };

        return {
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            getFormSteps,
            getAuthenticatedEntry,
            currentUser
        };
    }, [currentUser, allowedAccess]);

    return permissions;
}

export default usePermissions;