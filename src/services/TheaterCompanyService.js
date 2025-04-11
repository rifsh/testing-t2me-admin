import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TheaterCompanyService = {};

TheaterCompanyService.createTheaterCompany = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });

    return fetch({
        url: `${ApiConstant.ADD_THEATER_COMPANY_URL}?action=${encodedAction}`,
        method: "post",
        data: formData,
    });
}

TheaterCompanyService.getTheaterCompanies = (pageData) => {
    return fetch({
        url: ApiConstant.GET_THEATER_COMPANY_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
}
TheaterCompanyService.getTheaterCompanyById = (company_id) => {
    return fetch({
        url: ApiConstant.GET_THEATER_COMPANY_BYID_URL,
        method: "get",
        params: Utils.filterParams(company_id),
    });
}

TheaterCompanyService.editTheaterCompany = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });
    return fetch({
        url: `${ApiConstant.EDIT_THEATER_COMPANY_URL}?company_id=${data.id}&action=${encodedAction}`,
        method: "put",
        data: formData
    });
}

TheaterCompanyService.editCompanyTheaterStatus = (data, action) => {
    const encodedAction = encodeURIComponent(handleAction(action));
    return fetch({
        url: `${ApiConstant.EDIT_THEATER_COMPANY_STATUS_URL}?company_id=${data.id}&action=${encodedAction}`,
        method: "put",
        data: data
    });
}


export default TheaterCompanyService;