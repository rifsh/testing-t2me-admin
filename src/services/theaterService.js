import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TheaterService = {};

TheaterService.createTheater = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });

    return fetch({
        url: `${ApiConstant.ADD_THEATER_URL}?action=${encodedAction}`,
        method: "post",
        data: formData,
    });
}

TheaterService.getOrganaizerTheaters = function (pageData) {
    return fetch({
        url: `${ApiConstant.EVENT_ORGANIZER_THEATER}`,
        method: "get",
    });
};

TheaterService.getTheater = (pageData) => {
    return fetch({
        url: ApiConstant.GET_THEATER_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
}
TheaterService.getTheaterDropdownData = (pageData) => {
    return fetch({
        url: ApiConstant.GET_THEATER_DROPDOWN_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
}
TheaterService.getTheaterById = (theatre_id) => {
    return fetch({
        url: ApiConstant.GET_THEATERBYID_URL,
        method: "get",
        params: Utils.filterParams(theatre_id),
    });
}

TheaterService.editTheater = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });
    return fetch({
        url: `${ApiConstant.EDIT_THEATER_URL}?theatre_id=${data.id}&action=${encodedAction}`,
        method: "put",
        data: formData
    });
}

TheaterService.editTheaterStatus = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    return fetch({
        url: `${ApiConstant.EDIT_THEATER_STATUS_URL}?theatre_id=${data.id}&action=${encodedAction}`,
        method: "put",
        data: data
    });
}


export default TheaterService;