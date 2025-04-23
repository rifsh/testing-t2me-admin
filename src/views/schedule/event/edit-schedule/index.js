import React from "react";
import ScheduleForm from "../form-schedule/MultyStepScheduleForm";
import { useParams } from "react-router-dom";

const EditSchedule = () => {
  const { scheduleId } = useParams();
  return <ScheduleForm mode="EDIT" id={scheduleId} />;
};

export default EditSchedule;