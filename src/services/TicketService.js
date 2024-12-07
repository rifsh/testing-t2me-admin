import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const TicketsService = {};

TicketsService.getAllTickets = function () {
  return fetch({
    url:ApiConstant.TICKET_URL,	
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
