import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const MovieOrganizerService = {};

MovieOrganizerService.submitOrganizerMovieUpdate = function (
    data,
    action,
    params
) {
    const encodedAction = encodeURIComponent(handleAction(action));

    return fetch({
        url: `${ApiConstant.ORGANIZER_MOVIE_SEAT_APPROVAL_URL}?action=${encodedAction}`,
        method: "put",
        data: data,
        params: Utils.filterParams(params),
    });
};

export default MovieOrganizerService;
