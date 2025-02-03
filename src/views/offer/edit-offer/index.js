import React, { useEffect } from "react";
import OfferForm from "../form-offer";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOfferDetails } from "store/slices/offerSlice";

const EditOffer = () => {
  const dispatch = useDispatch();
  const { offerId } = useParams();
  const { offerDetails } = useSelector((state) => state.offers);
  useEffect(() => {
    if (offerId) {
      dispatch(fetchOfferDetails(offerId));
    }
  }, [dispatch,offerId]);

  return <OfferForm mode="EDIT" offer={offerDetails} />;
};

export default EditOffer;
