import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SubCategoryFormFields from "../../components/SubCategoryFormFields";
import {
  getSingleSubCateory
} from "store/slices/categorySlice";

const EditSubCategory = () => {
  const dispatch = useDispatch();
  const { subcatId } = useParams();
  const {
    singleSubcategory
  } = useSelector((state) => state.category);


  useEffect(() => {
    console.log("FETCHING SINGLE PLACE");
    console.log("SINGLE CATEGORY ID :-", subcatId);

    if (subcatId) {
      dispatch(getSingleSubCateory(subcatId))
    }
  }, [dispatch, subcatId]);

  return <SubCategoryFormFields mode="EDIT" category={singleSubcategory} />;
};

export default EditSubCategory;
