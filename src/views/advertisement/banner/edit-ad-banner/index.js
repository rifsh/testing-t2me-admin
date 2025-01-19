import React from "react";
import { useLocation,useParams } from "react-router-dom";
import AdBannerForm from "../form-ad-banner";

const EditAdBanner = () => {
  const location = useLocation();
   const { adBannerId } = useParams();
  const { mode = "EDIT", id = adBannerId } = location.state || {};

  return <AdBannerForm mode={mode} id={id} />;
};

export default EditAdBanner;
