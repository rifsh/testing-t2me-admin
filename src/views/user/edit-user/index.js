import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import UserForm from "../form-user";
import { getSingleUser } from "store/slices/userSlice";
import { useParams } from "react-router-dom";

const EditUser = () => {
  const dispatch = useDispatch();
  const userId = useParams();
  const { userDetails } = useSelector((state) => state.users);

  useEffect(() => {
    if (userId) {
      dispatch(getSingleUser(userId.userId));
    }
  }, [dispatch]);
  console.warn(userDetails);
  return <UserForm mode="EDIT" user={userDetails} />;
};

export default EditUser;
