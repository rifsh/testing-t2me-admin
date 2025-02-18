import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const IssuesService = {};

IssuesService.IssueReasignComment = function (IssueId, data) {
//   const encodedAction = encodeURIComponent(handleAction(action));
console.warn(IssueId,data)
  return fetch({
    url: `${ApiConstant.ISSUE_REASSIGN_COMMENT_URL}?issue_id=${IssueId}`,
    method: "post",
    data: data,
  });
};

IssuesService.AddNewIssue = function ( data) {
//   const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ISSUE_CREATION_URL}`,
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
IssuesService.getAllAlertissues = function (pageData) {
  return fetch({
    url: ApiConstant.ISSUE_ALERT_LIST_URL,
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
IssuesService.FetchAssignmentDetails = function (IssueId) {
  return fetch({
    url: `${ApiConstant.TICKET_ASSIGN_DETAILS_URL}?issue_id=${IssueId}`,
    method: "get",
  });
};
IssuesService.fetchCommentDetails = function (pageData) {
  return fetch({
    url: ApiConstant.ISSUE_REASSIGN_COMMENT_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
IssuesService.AdminCommenting = function (pageData) {
  return fetch({
    url: ApiConstant.ADMIN_COMMENT_URL,
    method: "post",
    data:pageData.data,
    params:Utils.filterParams(pageData.params),
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
IssuesService.IssueReasignUpdate = function (IssueId, CommentId,UserId, data ) {
//   const encodedAction = encodeURIComponent(handleAction(action));
console.log(IssueId, CommentId, data)
  return fetch({
    url: `${ApiConstant.ISSUE_REASSIGN_URL}?issue_id=${IssueId}&comment_id=${parseInt(CommentId)}&user_id=${UserId}`,
    method: "put",
    data: data,
  });
};

export default IssuesService;
