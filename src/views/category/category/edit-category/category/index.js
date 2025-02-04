import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CategoryFormFields from "../../components/CategoryFormFields";
import {
  getSingleCateory
} from "store/slices/categorySlice";

const EditCategory = () => {
  const dispatch = useDispatch();
  const { catId } = useParams();
  const {
    singleCategory
  } = useSelector((state) => state.category);


  useEffect(() => {
    console.log("FETCHING SINGLE PLACE");

    if (catId) {
      dispatch(getSingleCateory(catId))
    }
  }, [dispatch, catId]);

  return <CategoryFormFields mode="EDIT" category={singleCategory} />;
};

export default EditCategory;
