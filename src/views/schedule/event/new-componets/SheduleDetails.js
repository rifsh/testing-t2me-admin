import React, { useState } from "react";
import FormCard from "./FormCard";
import CalendarViewCard from "./PlanCard";

// Main Component
const ScheduleDetails = () => {
  const [tab, setTab] = useState(1);

  return (
    <div>
      {tab === 1 ? <FormCard onSubmit={() => setTab(2)} /> : <CalendarViewCard />}
    </div>
  );
};

export default ScheduleDetails;
