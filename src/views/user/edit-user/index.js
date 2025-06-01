import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import UserForm from "../form-user";
import { getSingleUser } from "store/slices/userSlice";
import { useParams } from "react-router-dom";

const EditUser = () => {
  const dispatch = useDispatch();
  const userId = useParams();
  const { singleUser } = useSelector((state) => state.users);
  console.log(userId.userId, "USERID");

  useEffect(() => {
    if (userId) {
      console.log("fetching single User--------");
      // dispatch(getSingleUser(userId.userId));
    }
  }, [dispatch, userId]);

  return <UserForm mode="EDIT" user={singleUser} />;
};

export default EditUser;
