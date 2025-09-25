import React, { useState } from "react";
import { Form } from "antd";
import FormCard from "./FormCard";
import CalendarViewCard from "./PlanCard";
import OfferCouponCard from "./OfferCouponCard";

// Main Component
const ScheduleDetails = () => {
  const [tab, setTab] = useState(1);
  const [form] = Form.useForm();

  const handleFormSubmit = (formData) => {
    console.log("Form submitted with data:", formData);
    setTab(2);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
  };

  const handleCancel = () => {
    form.resetFields();
    console.log("Form cancelled");
  };

  return (
    <div>
      {tab === 1 ? (
        <FormCard
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      ) : tab === 2 ? (
        <CalendarViewCard onSubmit={() => setTab(3)} form={form} />
      ) : (
        <OfferCouponCard
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          scheduleStartDate={"scheduleStartDate"}
          scheduleEndDate={"scheduleEndDate"}
        />
      )}
    </div>
  );
};

export default ScheduleDetails;
