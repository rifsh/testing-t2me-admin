import React from "react";
import CouponForm from "../form-coupon";
import { useLocation } from "react-router-dom";

const AddCoupon = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  return <CouponForm mode="ADD" type={type} />;
};

export default AddCoupon;
