import React, { useEffect } from "react";
import OfferForm from "../form-offer";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOfferDetails } from "store/slices/offerSlice";
import { isOrganizer } from "configs/UserAccessConfig";
import { EDIT } from "constants/AppConstants";

const EditOffer = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const isMakeChange = params.get("isMakeChange");
  const dispatch = useDispatch();
  const { offerId } = useParams();
  const { offerDetails } = useSelector((state) => state.offers);
  useEffect(() => {
    if (offerId) {
      dispatch(fetchOfferDetails({ offer_id: offerId }));
    }
  }, [dispatch, offerId]);

  return <OfferForm mode={EDIT} offer={offerDetails} type={type} isMakeChange={isMakeChange} />;
};

export default EditOffer;
