import React, { useEffect } from "react";
import AdScheduleForm from "../form-ad-schedule";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleSchedule } from "store/slices/advertisementSlice";

const EditAdSchedule = () => {
  const dispatch = useDispatch();
  const { scheduleId } = useParams();
  const { singleSchedule } = useSelector((state) => state.advertisement);
  useEffect(() => {
    if (scheduleId) {
      dispatch(getSingleSchedule(scheduleId));
    }
  }, [dispatch, scheduleId]);

  return <AdScheduleForm mode="EDIT" scheduleDetails={singleSchedule} id={scheduleId} />;
};

export default EditAdSchedule;
