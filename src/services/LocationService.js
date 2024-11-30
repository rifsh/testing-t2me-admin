import fetch from "auth/FetchInterceptor";
import { PLACE_WITH_COUNTRY_URL, VENUE_URL } from "constants/ApiConstant";

const LocationService = {};
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
  