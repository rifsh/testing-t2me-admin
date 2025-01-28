import React from "react";
import VenueForm from '../venueForm';
import { useParams } from "react-router-dom";

const EditVenue = () => {
  const { venueId } = useParams();

  return (
		<VenueForm mode="EDIT" venueId={venueId} />
	)
};

export default EditVenue;
