import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const AuthService = {};
AuthService.login = function (data) {
	return fetch({
		url: `/api/v1/auth/public/token`,
		method: 'post',
		data: data
	})
}
AuthService.logout = function () {
	return fetch({
		url:ApiConstant.LOG_OUT,
		method: 'post',
	})
}
export default AuthService;
