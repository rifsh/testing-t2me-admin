import fetch from "auth/FetchInterceptor";

const CategoryService = {};

CategoryService.addCategory = function (data) {
	return fetch({
		url: '/api/v1/events/secured/category',
		method: 'post',
		data: data
	})
}
CategoryService.fetchCategory = function () {
	return fetch({
		url: '/api/v1/events/secured/category',
		method: 'get'
	})
}

export default CategoryService;
