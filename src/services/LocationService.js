import fetch from "auth/FetchInterceptor";
import { PLACE_WITH_COUNTRY_URL, VENUE_URL } from "constants/ApiConstant";

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