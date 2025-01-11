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

  // Create FormData object
  const formData = new FormData();

  // Add base ticket data
  formData.append('name', data.name);
  formData.append('number_of_tickets', data.number_of_tickets);
  if (data.base_price) {
    formData.append('base_price', data.base_price);
  }

  // Add ticket types data
  if (data.ticket_types && data.ticket_types.length > 0) {
    data.ticket_types.forEach(ticket => {
      formData.append('ticket_type_names', ticket.name);
      formData.append('ticket_type_prices', ticket.price);
      formData.append('ticket_type_numbers', ticket.number_of_tickets);
      formData.append('ticket_set', ticket.ticket_set);
      formData.append('ticket_dataset_codes', ticket.datasetCode); // Add datasetCode field
    });
  }

  return fetch({
    url: `${ApiConstant.TICKET_URL}?venue_id=${data.venue_id}&action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default TicketsService;

TicketsService.getAvailableTicketsType = function () {
  return fetch({
    url: ApiConstant.AVAILABLE_TICKET_TYPE_URL,
    method: "get",
  });
};