import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { BOOKING_TYPE } from "constants/QrConstants";
import Utils from "utils";

export const verifyEventBookingUtil = async (bookingType, bookingTicketId, eventId) => {
    try {
        let url = "";
        let method = "put";
        let params = { booking_ticket_id: bookingTicketId, event_id: eventId };
        console.log("testing purpose", bookingType, params);

        switch (bookingType) {
            case BOOKING_TYPE.etb:
                url = ApiConstant.EVENT_TICKET_BOOKNG_VERIFICATION;
                break;
            case BOOKING_TYPE.ebs:
                url = ApiConstant.EVENT_SEAT_BOOKNG_VERIFICATION;
                break;
            case BOOKING_TYPE.ebm:
                url = ApiConstant.MOVIE_BOOKNG_VERIFICATION;
                break;
            default:
                throw new Error("Invalid booking type provided");
        }

        const response = await fetch({
            url,
            method,
            params: Utils.filterParams(params),
        });

        return response;
    } catch (error) {
        console.error("Error verifying event booking:", error);
        throw error;
    }
};
