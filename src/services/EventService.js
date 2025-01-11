import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventsService = {};

EventsService.addEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = new FormData();


  const appendIfExists = (key, value) => {
    if (value) formData.append(key, value);
  };


  formData.append("event_name", data.event_name);
  formData.append("description", data.description);
  formData.append("available_types", data.available_types);
  formData.append("max_tickets", data.max_tickets);
  formData.append("venue_id", data.venue_id);
  formData.append("category_id", data.category_id);
  formData.append("sub_category_id", data.sub_category_id);


  appendIfExists("ticket_structure_id", data.ticket_structure_id);
  appendIfExists("ticket_set", data.ticket_set);
  appendIfExists("seat_structure_id", data.seat_structure_id);
  appendIfExists("offer_ids", data.offer_ids);
  appendIfExists("coupon_ids", data.coupon_ids);
  if (data.tax_ids && Array.isArray(data.tax_ids)) {
    data.tax_ids.forEach(id => {
      formData.append("tax_ids", id);
    });
  }


  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }
  if (data.banner_images && Array.isArray(data.banner_images)) {
    data.banner_images.forEach((image) => {
      formData.append("banner_images", image.originFileObj);
    });
  }

  return fetch({
    url: `${ApiConstant.EVENT_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
  });
};

EventsService.getAllEvent = function (pageData) {
  // const params = {};
  // if (pageData.page !== null) params.page = pageData.page;
  // if (pageData.size !== null) params.size = pageData.size;
  // if (pageData.search !== null) params.search = pageData.search;

  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

EventsService.checkValidation = function () {
  return fetch({
    url: ApiConstant.EVENT_VALIDATION_URL,
    method: "get",
  });
};
EventsService.fetchEventDetails = function (eventId) {
  return fetch({
    url: `${ApiConstant.EVENT_DETAILS_URL}?event_id=${eventId}`,
    method: "get",
  });
};
EventsService.updateEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_EVENT_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};

export default EventsService;
