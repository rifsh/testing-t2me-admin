import fetch from 'auth/FetchInterceptor'

const LocationService = {}

LocationService.getAllCountries = function () {
	return fetch({
		url: '/api/v1/location/secured/country/',
		method: 'get',
	})
		.then((response) => {
			console.log("fetched Countries = ", response.data);
			return response.data;
		})
		.catch((error) => {
			console.error("Error fetching Countries:", error);
			throw error;
		});
};

LocationService.createPlace = function (placeData) {
	return fetch({
		url: '/api/v1/location/secured/place/',
		method: 'post',
		data: placeData,
	})
		.then((response) => {
			console.log("Place created:", response.data);
			return response.data;
		})
		.catch((error) => {
			console.log("Error creating Place:", error);
			throw error;
		});
};


export default LocationService;