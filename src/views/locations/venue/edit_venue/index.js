import React from "react";
import VenueForm from '../venueForm';
import { useLocation, useParams } from "react-router-dom";

const EditVenue = () => {
  const { venueId } = useParams();
 const location = useLocation();
  const params = new URLSearchParams(location.search);

  const isMakeChanges = params.get("isMakeChanges");
  return (
		<VenueForm mode="EDIT" venueId={venueId} isMakeChanges={isMakeChanges} />
	)
};

export default EditVenue;
