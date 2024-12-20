import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const TicketsService = {};

TicketsService.getAllTickets = function (venueId) {
  console.warn("venueId",venueId)
  return fetch({
    url: `${ApiConstant.TICKET_URL}${venueId ? `?venue_id=${venueId}` : ""}`,
    method: "get",
  });
};
TicketsService.editTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TICKET_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
TicketsService.addTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TICKET_URL}?venue_id=${data.venue_id}&action=${encodedAction}`,
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