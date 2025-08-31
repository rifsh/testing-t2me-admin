import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import UserForm from "../form-user";
import { getSingleUser } from "store/slices/userSlice";
import { useParams } from "react-router-dom";
import { EDIT } from "constants/AppConstants";

const EditUser = () => {
  const dispatch = useDispatch();
  const userId = useParams();
  const { editSingleUser } = useSelector((state) => state.users);

  useEffect(() => {
    if (userId) {
      console.log("fetching single User--------");
      dispatch(getSingleUser(userId.userId));
    }
  }, [dispatch]);

  return <UserForm mode={EDIT} user={editSingleUser} />;
};

export default EditUser;
