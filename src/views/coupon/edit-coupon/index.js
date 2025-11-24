import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import CouponForm from "../form-coupon";
import { useDispatch, useSelector } from "react-redux";
import { fetchCouponDetails } from "store/slices/couponSlice";
import { EDIT } from "constants/AppConstants";

const EditEvent = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const isMakeChanges = params.get("isMakeChanges");
  
  const dispatch = useDispatch();
  const { couponId } = useParams();
  const { couponDetails } = useSelector((state) => state.coupons);
  useEffect(() => {
    if (couponId) {
      dispatch(fetchCouponDetails(couponId));
    }
  }, [dispatch, couponId]);

  return <CouponForm mode={EDIT} coupon={couponDetails} type={type} isMakeChanges={isMakeChanges } />;
};

export default EditEvent;
