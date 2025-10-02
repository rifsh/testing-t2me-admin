import React from "react";
// import ScheduleForm from "../form-schedule/MultyStepScheduleForm";
import { useParams } from "react-router-dom";
import ScheduleDetails from "../new-componets/SheduleDetails";
import { EDIT } from "constants/AppConstants";

const EditSchedule = () => {
  const { scheduleId } = useParams();
  return <ScheduleDetails mode={EDIT} id={scheduleId} />;
};

export default EditSchedule;
