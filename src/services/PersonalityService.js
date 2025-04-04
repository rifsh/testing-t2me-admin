import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const PersonalityService = {};

PersonalityService.addPersonality = function (data, action) {
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });
    const encodedAction = encodeURIComponent(handleAction(action));
    return fetch({
        url: `${ApiConstant.ADD_PERSONALITY_URL}?action=${encodedAction}`,
        method: "post",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
PersonalityService.getPersonalityData = function (pageData) {
    return fetch({
        url: ApiConstant.GET_PERSONALITY_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
PersonalityService.getPersonalityDataById = function (person_id) {
    return fetch({
        url: ApiConstant.GET_PERSONALITYBYID_URL,
        method: "get",
        params: Utils.filterParams(person_id),
    });
};
PersonalityService.editPersonality = function (
    updatedPersonality,
    action,
) {
    const formData = Utils.createFormData(updatedPersonality, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });
    const encodedAction = encodeURIComponent(handleAction(action));

    return fetch({
        url: `${ApiConstant.EDIT_PERSONALITY_URL}?person_id=${updatedPersonality.id}&action=${encodedAction}`,
        method: "put",
        data: formData
    });
};
PersonalityService.editStatus = function (
    updatedPersonality,
    action,
) {
    const encodedAction = encodeURIComponent(handleAction(action));

    return fetch({
        url: `${ApiConstant.EDIT_PERSONALITY_STATUS_URL}?person_id=${updatedPersonality.id}&action=${encodedAction}`,
        method: "put",
        data: updatedPersonality
    });
};

export default PersonalityService;
