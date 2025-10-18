import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";
import { verifyEventBookingUtil } from "utils/qrScannerUtil";

const QrVerificationService = {};

QrVerificationService.getUserData = function (pageData) {
    return fetch({
        url: ApiConstant.USER_LIST,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
QrVerificationService.getFoodData = function (pageData) {
    return fetch({
        url: ApiConstant.ADDON_LIST,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
// QrVerificationService.getPermissionDisplayNames = function (pageData) {
//     return fetch({
//         url: ApiConstant.GET_PERSMISSIONS_DISPLAY_NAMES,
//         method: "get",
//         params: Utils.filterParams(pageData),
//     });
// };
QrVerificationService.consumeUsers = function (data, bookingTicketId) {
    const params = { booking_ticket_id: bookingTicketId }
    return fetch({
        url: `${ApiConstant.CONSUME_USER_LIST}`,
        method: "put",
        params,
        data: data,
    });
};
QrVerificationService.consumeAddons = function (data, bookingTicketId) {
    const params = { booking_ticket_id: bookingTicketId }
    return fetch({
        url: `${ApiConstant.CONSUME_ADDON_LIST}`,
        method: "put",
        params,
        data: data,
    });
};
QrVerificationService.verifyEvenetBooking = async function (bookingType, bookingTicketId, eventId, showSeatId, userId) {
    return await verifyEventBookingUtil(bookingType, bookingTicketId, eventId, showSeatId, userId);

    // return fetch({
    //     url: `${ApiConstant.CONSUME_USER_LIST}`,
    //     method: "put",
    //     params,
    //     data: data,
    // });
};

export default QrVerificationService;
