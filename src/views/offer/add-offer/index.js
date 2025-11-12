import React from "react";
import { useLocation, useParams } from "react-router-dom";
import OfferForm from "../form-offer";

const AddOffer = () => {
  const {type} = useParams();
  
  return <OfferForm mode="ADD" type={type}/>;
};

export default AddOffer;
