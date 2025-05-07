import React from "react";
import { useLocation } from "react-router-dom";
import OfferForm from "../form-offer";

const AddOffer = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  return <OfferForm mode="ADD" type={type}/>;
};

export default AddOffer;
