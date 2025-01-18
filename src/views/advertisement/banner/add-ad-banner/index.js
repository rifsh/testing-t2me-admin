import React from "react";
import { useLocation } from "react-router-dom";
import AdBannerForm from "../form-ad-banner";

const AddAdBanner = () => {
  const location = useLocation();
  const { mode = "ADD", id = null } = location.state || {};

  return <AdBannerForm mode={mode} id={id} />;
};

export default AddAdBanner;
