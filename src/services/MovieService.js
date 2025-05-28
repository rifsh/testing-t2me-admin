import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const movieService = {};

movieService.getOmdbMovieData = function (pageData) {
    return fetch({
        url: ApiConstant.OMDB_API_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.getOmdbMovie = function (pageData) {
    return fetch({
        url: ApiConstant.OMDB_DETAIL_API_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.getMovieLanguages = function (pageData) {
    return fetch({
        url: ApiConstant.GET_LANGUAGES,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.getMovieGenres = function (pageData) {
    return fetch({
        url: ApiConstant.GET_GENRES,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.addMovie = function (data, action) {
    const formData = Utils.createFormData(data, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });
    const encodedAction = encodeURIComponent(handleAction(action));
    return fetch({
        url: `${ApiConstant.ADD_MOVIE_URL}?action=${encodedAction}`,
        method: "post",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
movieService.editMovie = function (
    updatedPersonality,
    action,
) {
    const formData = Utils.createFormData(updatedPersonality, {
        fileKeys: ["thumbnail_image"],
        skipEmpty: true,
    });

    const encodedAction = encodeURIComponent(handleAction(action));

    const params = {
        movie_id: updatedPersonality.id,
        action: encodedAction,
    };

    return fetch({
        url: ApiConstant.EDIT_MOVIE_URL,
        method: "put",
        data: formData,
        params: params,
    });
};
movieService.getMovieData = function (pageData) {
    return fetch({
        url: ApiConstant.GET_MOVIE_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.getMovieDataById = function (person_id) {
    return fetch({
        url: ApiConstant.GET_MOVIEBYID_URL,
        method: "get",
        params: Utils.filterParams(person_id),
    });
};
movieService.editStatus = function (
    updatedPersonality,
    action,
) {
    const encodedAction = encodeURIComponent(handleAction(action));

    const params = {
        movie_id: updatedPersonality.id,
        action: encodedAction,
    };

    return fetch({
        url: ApiConstant.EDIT_MOVIE_STATUS_URL,
        method: "put",
        data: updatedPersonality,
        params: params,
    });
};
export default movieService;
