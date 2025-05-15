import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const ReportService = {
  fetchReports: function (pageData, contentType = null) {
    const params = {
      ...Utils.filterParams(pageData),
      ...(contentType && { content_type: contentType }),
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



  //user-detail-report events
  fetchUserDetails: function (userId) {
    return fetch({
      url: ApiConstant.REPORT_USER_DETAIL,
      method: "get",
      params: { user_id: userId },
    });
  },

   fetchEventDetails: function (eventId) {
    return fetch({
      url: ApiConstant.REPORT_EVENT_DETAIL,
      method: "get",
      params: { event_id: eventId },
    });
  },


    // user-specific reports movies
 fetchMovieUserDetails: function (userId) {
    return fetch({
      url: ApiConstant.REPORT_USER_DETAIL_MOVIES,
      method: "get",
      params: { user_id: userId },
    });
  },
fetchTheaterDetails: function (theaterId) {
    return fetch({
      url: ApiConstant.REPORT_THEATER_DETAIL,
      method: "get",
      params: { theatre_id: theaterId },
    });
  },



};

export default ReportService;