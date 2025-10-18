import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { BOOKING_TYPE } from "constants/QrConstants";
import Utils from "utils";

export const verifyEventBookingUtil = async (bookingType, bookingTicketId, eventId, showSeatId, userId) => {
    try {
        let url = "";
        let method = "put";
        let params = {};

        console.log("testing purpose", bookingType, { bookingTicketId, eventId, showSeatId });

        switch (bookingType) {
            case BOOKING_TYPE.etb:
                url = ApiConstant.EVENT_TICKET_BOOKNG_VERIFICATION;
                params = { booking_ticket_id: bookingTicketId, event_id: eventId };
                break;

            case BOOKING_TYPE.ebs:
                url = ApiConstant.EVENT_SEAT_BOOKNG_VERIFICATION;
                params = { booking_id: bookingTicketId, show_seats_id: showSeatId, event_id: eventId, user_id: userId };
                break;

            case BOOKING_TYPE.ebm:
                url = ApiConstant.MOVIE_BOOKNG_VERIFICATION;
                params = { booking_ticket_id: bookingTicketId, event_id: eventId, show_seats_id: showSeatId };
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
        console.error("Error verifying event booking:", bookingType, error);
        throw error;
    }
};
