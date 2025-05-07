import React, { useEffect } from "react";
import OfferForm from "../form-offer";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOfferDetails } from "store/slices/offerSlice";

const EditOffer = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const dispatch = useDispatch();
  const { offerId } = useParams();
  const { offerDetails } = useSelector((state) => state.offers);
  useEffect(() => {
    if (offerId) {
      dispatch(fetchOfferDetails(offerId));
    }
  }, [dispatch, offerId]);

  return <OfferForm mode="EDIT" offer={offerDetails} type={type} />;
};

export default EditOffer;
