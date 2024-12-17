import React from "react";
import CountryForm from "../form-place";
import { useParams } from "react-router-dom";

const EditPlace = () => {
  const { placeId } = useParams();

  return <CountryForm placeId={placeId} />;
};

export default EditPlace;
