import React from "react";
import { useLocation,useParams } from "react-router-dom";
import CategoryForm from "../form-ad-category";

const EditAdCategory = () => {
  const location = useLocation();
   const { adCategoryId } = useParams();
  const { mode = "EDIT", id = adCategoryId } = location.state || {};

  return <CategoryForm mode={mode} id={id} />;
};

export default EditAdCategory;
