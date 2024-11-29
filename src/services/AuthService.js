import fetch from "auth/FetchInterceptor";
import { API_BASE_URL } from "constants/ApiConstant";

const AuthService = {};
AuthService.login = function (data) {
	return fetch({
		url: `/api/v1/auth/public/token`,
		method: 'post',
		data: data
	})
}
export default AuthService;
