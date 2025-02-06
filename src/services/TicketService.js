import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TicketsService = {};

TicketsService.getAllTickets = function (pageData) {
  return fetch({
    url: ApiConstant.TICKET_URL,
    method: "get",
    params: Utils.filterParams(pageData),
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

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.TICKET_URL}?venue_id=${data.venue_id}&action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

TicketsService.validateTicket = function (ticketId) {
  return fetch({
    url: `${ApiConstant.TICKET_VALIDATE_URL}?ticket_id=${ticketId}`,
    method: "get",
  });
};

export default TicketsService;

TicketsService.getAvailableTicketsType = function () {
  return fetch({
    url: ApiConstant.AVAILABLE_TICKET_TYPE_URL,
    method: "get",
  });
};
