import React from "react";
import ScheduleForm from "../form-schedule/MultyStepScheduleForm";
import EventConfigForm from "../new-componets/SheduleDetails";
import { ADD } from "constants/AppConstants";

const AddSchedule = () => {
  return (
    <ScheduleForm mode={ADD} />
    // <EventConfigForm/>
  );
};

export default AddSchedule;
