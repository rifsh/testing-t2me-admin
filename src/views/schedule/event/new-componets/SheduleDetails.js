import React, { useState, useEffect, useRef } from "react";
import { Form } from "antd";
import FormCard from "./FormCard";
import CalendarViewCard from "./PlanCard";
import OfferAndCoupons from "./OfferAndCoupons";
import { useDispatch, useSelector } from "react-redux";
import { setScheduleFormData } from "store/slices/scheduleSlice";

// Main Component
const ScheduleDetails = () => {
  const [tab, setTab] = useState(1);
  const { scheduleFormData } = useSelector((state) => state.schedules);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Use ref to track if form has been initialized
  const isFormInitialized = useRef(false);
  const lastScheduleFormData = useRef(null);

  // Preserve form data when switching tabs - Fixed infinite loop
  useEffect(() => {
    // Only set form values if:
    // 1. scheduleFormData exists and has data
    // 2. scheduleFormData has actually changed (different reference or content)
    // 3. Form hasn't been initialized yet OR data has meaningfully changed
    if (
      scheduleFormData &&
      Object.keys(scheduleFormData).length > 0 &&
      (!isFormInitialized.current ||
        JSON.stringify(scheduleFormData) !==
          JSON.stringify(lastScheduleFormData.current))
    ) {
      console.log("Setting form values:", scheduleFormData);

      // Set form values without triggering onChange
      form.setFieldsValue(scheduleFormData);

      // Mark as initialized and store reference
      isFormInitialized.current = true;
      lastScheduleFormData.current = { ...scheduleFormData };

      console.log("Form initialized/updated with data");
    }
  }, [scheduleFormData, form]);

  // Reset initialization flag when tab changes
  useEffect(() => {
    isFormInitialized.current = false;
  }, [tab]);

  const handleFormSubmit = (formData) => {
    console.log("Form submitted with data:", formData);
    dispatch(setScheduleFormData(formData));
    setTab(2);
  };

  const handleTimeSlotSubmit = (formData) => {
    console.log("Time slot data:", formData);
    dispatch(setScheduleFormData(formData));
    setTab(3);
  };

  const handleOfferSubmit = (formData) => {
    console.log("Offer and coupon data:", formData);

    // Merge offer and coupon data with existing form data
    const mergedData = {
      ...scheduleFormData,
      ...formData,
      // Properly merge the selected offers and coupons
      offer_ids:
        formData.selectedoffers?.map((offer) => ({
          offer_id: offer.offer.id,
          valid_from: offer.offer.startdate,
          valid_to: offer.offer.enddate,
        })) ||
        scheduleFormData.offer_ids ||
        [],
      coupon_ids:
        formData.selectedcoupons?.map((coupon) => ({
          coupon_id: coupon.id,
          valid_from: coupon.coupons.startdate,
          valid_to: coupon.coupons.enddate,
        })) ||
        scheduleFormData.coupon_ids ||
        [],
    };

    dispatch(setScheduleFormData(mergedData));
    console.log("Final merged data:", mergedData);
  };

  const handleBack = () => {
    // Get current form data
    const currentFormData = form.getFieldsValue();

    // Only dispatch if there are meaningful changes
    const hasChanges = Object.keys(currentFormData).some(
      (key) => currentFormData[key] !== scheduleFormData[key]
    );

    if (hasChanges) {
      const dataToPreserve = {
        ...scheduleFormData,
        ...currentFormData,
      };

      dispatch(setScheduleFormData(dataToPreserve));
      console.log("Preserved data when going back:", dataToPreserve);
    }

    setTab(tab - 1);
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(setScheduleFormData({})); // Clear Redux state
    isFormInitialized.current = false; // Reset initialization flag
    lastScheduleFormData.current = null; // Clear reference
    console.log("Form cancelled and state cleared");
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
        <CalendarViewCard
          onSubmit={handleTimeSlotSubmit}
          form={form}
          onBack={handleBack}
        />
      ) : (
        <OfferAndCoupons
          form={form}
          onSubmit={handleOfferSubmit}
          onBack={handleBack}
          initialData={scheduleFormData}
        />
      )}
    </div>
  );
};

export default ScheduleDetails;
