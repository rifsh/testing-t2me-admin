import React, { useEffect } from "react";
import AdScheduleForm from "../form-ad-schedule";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleSchedule } from "store/slices/advertisementSlice";
import LoadingOverlay from "components/util-components/Loader/index";
import { Spin } from "antd";

const EditAdSchedule = () => {
  const dispatch = useDispatch();
  const { scheduleId } = useParams();
  const { singleSchedule, loading } = useSelector(
    (state) => state.advertisement
  );
  useEffect(() => {
    if (scheduleId) {
      dispatch(getSingleSchedule(scheduleId));
    }
  }, [dispatch, scheduleId]);

  // if (loading) {
  //   return <LoadingOverlay loading={loading} />;
  // }

  return (
    <>
      <LoadingOverlay loading={loading} />
      <AdScheduleForm
        mode="EDIT"
        scheduleDetails={singleSchedule}
        id={scheduleId}
      />
    </>
  );
};

export default EditAdSchedule;
