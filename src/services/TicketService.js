import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TicketsService = {};

TicketsService.getAllTickets = function (pageData) {
  const url = Utils.getUrlByUserRole(
      ApiConstant.TICKET_URL,
      ApiConstant.EVENT_ORGANIZER_TICKET_URL,
      isOrganizer()
    );
  return fetch({
    url: url,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

TicketsService.getSingleTicketData = function (ticketId) {
  return fetch({
    url: ApiConstant.EVENT_SINGLE_TICKET,
    method: "get",
    params: {
      ticket_id: ticketId,
    },
  });
};
TicketsService.editTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.TICKET_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
  });
};
TicketsService.addTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  const url = Utils.getUrlByUserRole(
      ApiConstant.TICKET_URL,
      ApiConstant.EVENT_ORGANIZER_TICKET_URL,
      isOrganizer()
    );
  return fetch({
    url:url,
    method: "post",
    data: data,
    params: {
      venue_id: data.venue_id,
      action: encodedAction,
    },
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};

TicketsService.validateTicket = function (ticketId) {
  return fetch({
    url: ApiConstant.TICKET_VALIDATE_URL,
    method: "get",
    params: {
      ticket_id: ticketId,
    },
  });
};

export default TicketsService;

TicketsService.getAvailableTicketsType = function (pageData) {
  return fetch({
    url: ApiConstant.AVAILABLE_TICKET_TYPE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
