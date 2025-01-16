import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const IssuesService = {};

IssuesService.IssueReasignComment = function (IssueId, data) {
//   const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ISSUE_REASSIGN_COMMENT_URL}?issue_id=${IssueId}`,
    method: "post",
    data: data,
  });
};

IssuesService.getAllIssue = function (pageData) {
  return fetch({
    url: ApiConstant.ISSUE_LIST_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

IssuesService.checkValidation = function () {
  return fetch({
    url: ApiConstant.EVENT_VALIDATION_URL,
    method: "get",
  });
};
IssuesService.fetchIssueDetails = function (IssueId) {
  return fetch({
    url: `${ApiConstant.ISSUE_DETAILS_URL}?issue_id=${IssueId}`,
    method: "get",
  });
};
IssuesService.IssueStatusUpdate = function (IssueId, data ) {
//   const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ISSUE_STATUS_UPDATE_URL}?issue_id=${IssueId}`,
    method: "put",
    data: data,
  });
};
IssuesService.IssueCloseUpdate = function (IssueId, data ) {
//   const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ISSUE_CLOSE_URL}?issue_id=${IssueId}`,
    method: "put",
    data: data,
  });
};
IssuesService.IssueReasignUpdate = function (IssueId, data ) {
//   const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ISSUE_REASSIGN_URL}?issue_id=${IssueId}`,
    method: "put",
    data: data,
  });
};

export default IssuesService;
