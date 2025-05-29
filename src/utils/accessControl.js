import { ROLE_ACCESSES } from "constants/permissionsConstants";

/**
 * Check if a user with a given role has a specific permission
 * @param {number} currentRole - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (currentRole, permission) => {
    if (!currentRole) return false;

    const allowedPermissions = ROLE_ACCESSES[currentRole] || [];
    return allowedPermissions.includes(permission);
};

/**
 * Get all permissions for a specific role
 * @param {number} role - The role to get permissions for
 * @returns {array} - Array of permissions for the role
 */
export const getPermissionsForRole = (role) => {
    return ROLE_ACCESSES[role] || [];
};