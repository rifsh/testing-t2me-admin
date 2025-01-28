import fetch from "auth/FetchInterceptor";

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
		url: `/api/v1/auth/public/logout`,
		method: 'post',
	})
}
export default AuthService;
