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
     pageData.isOrganizer
    );
  return fetch({
    url: url,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

TicketsService.makeChangeTicket = function (data, action, pageData) {
  console.log(data, "DATA IN SERVICE");

  const encodedAction = encodeURIComponent(handleAction(action));

  const offerUrl = ApiConstant.ORGANIZER_TICKET_MAKE_CHANGES_URL;
  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: `${offerUrl}`,
    method: "put",
    data: data,
    params: params,
    
  });
};

TicketsService.checkTicketEditAvailability = function (params) {
  return fetch({
    url: ApiConstant.CHECK_TICKET_EDIT_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
TicketsService.getSingleTicketData = function (ticketId) {
  const url = Utils.getUrlByUserRole(
    ApiConstant.EVENT_SINGLE_TICKET,
    ApiConstant.ORGANIZER_TICKET_DETAIL_URL,
    isOrganizer()
  );

  return fetch({
    url: url,
    method: "get",
    params: {
      ticket_id: ticketId,
      ticket_structure_id:ticketId
    },
  });
};
TicketsService.editTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: `${ApiConstant.TICKET_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
TicketsService.addTicket = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

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
