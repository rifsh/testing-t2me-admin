import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const TicketsService = {};

TicketsService.getAllTickets = function (venueId) {
  return fetch({
    url: `${ApiConstant.TICKET_URL}?venue_id=${venueId}`,
    method: "get",
  });
};

TicketsService.addTicket = function (data,venueId) {

  return fetch({
    url: `${ApiConstant.TICKET_URL}?venue_id=${venueId}`,
    method: "post",
    data: data,
  });
};
export default TicketsService;

TicketsService.getAvailableTicketsType = function () {
  return fetch({
    url: ApiConstant.AVAILABLE_TICKET_TYPE_URL,
    method: "get",
  });
};