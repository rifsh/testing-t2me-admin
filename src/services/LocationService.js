import fetch from 'auth/FetchInterceptor'

const LocationService = {}

LocationService.login = function (data) {
	return fetch({
		url: '/auth/login',
		method: 'post',
		data: data
	})
}

LocationService.register = function (data) {
	return fetch({
		url: '/auth/register',
		method: 'post',
		data: data
	})
}

LocationService.logout = function () {
	return fetch({
		url: '/auth/logout',
		method: 'post'
	})
}

LocationService.loginInOAuth = function () {
	return fetch({
		url: '/auth/loginInOAuth',
		method: 'post'
	})
}

export default LocationService;