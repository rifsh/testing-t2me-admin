import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

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
AuthService.register = function (data) {
	  
	const formData = Utils.createFormData(data, {
		fileKeys: ["thumbnail_image"],
		skipEmpty: true,
	  });
	  
	return fetch({
		url: ApiConstant.LEAD_REGISTER,
		method: 'post',
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
		  },
	})
}
AuthService.verifyOtp = function (data) {

	return fetch({
		url: ApiConstant.LEAD_OTP_VERIFY,
		method: 'put',
		data: data,
	})
}

AuthService.ResendOtp = function (data) {

	return fetch({
		url: ApiConstant.LEAD_OTP_RESEND,
		method: 'post',
		data: data,
	})
}


  

export default AuthService;
