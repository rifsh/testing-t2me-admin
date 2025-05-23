import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { fetchMovieList } from "store/slices/reportSlice";
import Utils from "utils";

const ReportService = {
  fetchReports: function (pageData, contentType = null, countryId = null) {
    const params = {
      ...Utils.filterParams(pageData),
      ...(contentType && { content_type: contentType }),
      ...(countryId && { country_id: countryId }),
    };

    return fetch({
      url: ApiConstant.ADMIN_REPORT,
      method: "get",
      params: params,
    });
  },

  // user-specific reports
  fetchUserReports: function (pageData) {
    const params = Utils.filterParams(pageData);

    return fetch({
      url: ApiConstant.REPORT_USERS,
      method: "get",
      params: params,
    });
  },

  fetchUserDetails: function (userId, countryId) {
    return fetch({
      url: ApiConstant.REPORT_USER_DETAIL,
      method: "get",
      params: {
        user_id: userId,
        country_id: countryId,
      },
    });
  },

  fetchUserTheaters: function (userId, countryId) {
    return fetch({
      url: ApiConstant.REPORT_USER_THEATERS,
      method: "get",
      params: {
        user_id: userId,
        country_id: countryId,
      },
    });
  },

  // fetchEventList: function (userId, countryId) {
  //   return fetch({
  //     url: ApiConstant.REPORT_EVENT_LISTING,
  //     method: "get",
  //     params: {
  //       user_id: userId,
  //       country_id: countryId,
  //     },
  //   });
  // },

    fetchEventList: function (pageData) {
    const params = Utils.filterParams(pageData);

    return fetch({
      url: ApiConstant.REPORT_EVENT_LISTING,
      method: "get",
      params: params,
    });
  },

  // fetchMovieList: function (theaterId) {
  //   return fetch({
  //     url: ApiConstant.REPORT_MOVIE_LISTING,
  //     method: "get",
  //     params: {
  //       theatre_id: theaterId,
  //     },
  //   });
  // },


    fetchMovieList: function (pageData) {
    const params = Utils.filterParams(pageData);

    return fetch({
      url: ApiConstant.REPORT_MOVIE_LISTING,
      method: "get",
      params: params,
    });
  },

  //exports
  fetchReportExport: function (pageData) {
    const params = Utils.filterParams(pageData);

    return fetch({
      url: ApiConstant.REPORT_EXPORTS,
      method: "get",
      params: params,
    });
  },

  fetchEventDetails: function (eventId, countryId) {
    return fetch({
      url: ApiConstant.REPORT_EVENT_DETAIL,
      method: "get",
      params: { event_id: eventId, country_id: countryId },
    });
  },

  // user-specific reports movies
  fetchMovieUserDetails: function (userId, countryId) {
    return fetch({
      url: ApiConstant.REPORT_USER_DETAIL_MOVIES,
      method: "get",
      params: { user_id: userId, country_id: countryId },
    });
  },
  fetchTheaterDetails: function (theaterId) {
    return fetch({
      url: ApiConstant.REPORT_THEATER_DETAIL,
      method: "get",
      params: { theatre_id: theaterId },
    });
  },

  // Ensure your service function matches parameters
  fetchMovieDetails: function (movieId, theaterId) {
    return fetch({
      url: ApiConstant.REPORT_MOVIE_DETAIL,
      method: "get",
      params: {
        movie_id: movieId,
        theatre_id: theaterId,
      },
    });
  },

  fetchCountryList: function (pageData) {
    const params = Utils.filterParams(pageData);

    return fetch({
      url: ApiConstant.REPORT_COUNTRY_LIST,
      method: "get",
      params: params,
    });
  },
};

export default ReportService;
