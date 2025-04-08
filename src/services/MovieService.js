import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const movieService = {};

movieService.getOmdbMovieData = function (pageData) {
    return fetch({
        url: ApiConstant.OMDB_API_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
movieService.getOmdbMovie= function (pageData) {
    return fetch({
        url: ApiConstant.OMDB_DETAIL_API_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};

export default movieService;
