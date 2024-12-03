import fetch from "auth/FetchInterceptor";
import { PLACE_URL, PLACE_WITH_COUNTRY_URL, VENUE_URL } from "constants/ApiConstant";

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

LocationService.addPlace = function (data) {
	return fetch({
		url: PLACE_URL,
		method: "post",
		data: data,
	});
};
LocationService.addVenue = function (data, place_id) {
	console.log('venue data service',data);
	
	return fetch({
		url:`${VENUE_URL}${place_id}`,
		method: "post",
		data: data,
	});
};

LocationService.placeWithCountry = function (place) {
	return fetch({
		url: `${PLACE_WITH_COUNTRY_URL}${place}`,
		method: "get",
	});
};

LocationService.addVenue = function (data) {
	return fetch({
		url: VENUE_URL,
		method: "post",
		data: data,
	});
};

export default LocationService;