import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import CouponForm from "../form-coupon";
import { useDispatch, useSelector } from "react-redux";
import { fetchCouponDetails } from "store/slices/couponSlice";

const EditEvent = () => {
  const dispatch = useDispatch();
  const { couponId } = useParams();
  const { couponDetails } = useSelector((state) => state.coupons);
  useEffect(() => {
    if (couponId) {
      dispatch(fetchCouponDetails(couponId));
    }
  }, [dispatch, couponId]);

  return <CouponForm mode={"EDIT"} coupon={couponDetails}/>;
};

export default EditEvent;
