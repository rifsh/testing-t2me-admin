import { APPROVAL_STATUS } from "constants/AppConstants";

class OrganizerlUtils {
    static getApprovalStatus(action) {
        switch (action?.toLowerCase()) {
            case 'approve':
                return APPROVAL_STATUS.APPROVED;
            case 'reject':
                return APPROVAL_STATUS.REJECTED;
            case 'change request':
                return APPROVAL_STATUS.CHANGE_REQUEST;
            default:
                return APPROVAL_STATUS.PENDING;
        }
    }
}

export default OrganizerlUtils;
