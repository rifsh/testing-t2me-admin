import React, { useEffect } from "react";
import { Modal, DatePicker, Form, Button, message } from "antd";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import Utils from "utils";
// import {
//   isEndDateValid,
//   isStartDateBeforeSchedule,
//   isEndDateAfterSchedule,
//   dispatchOfferDates,
// } from "utils/dateUtils";

const OfferDateModal = ({
  isModalVisible,
  isOffer,
  handleModalClose,
  selectedItemForModal,
  scheduleStartDate,
  scheduleEndDate,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedItemForModal) {
      console.log(scheduleStartDate, "start date");
      console.log(scheduleEndDate, "end date");
    }
  }, [selectedItemForModal, form]);

  const handleFormSubmit = (values) => {
    const { valid_from, valid_to } = values;

    // Use the utility function for validation
    if (Utils.isEndDateValid(valid_from, valid_to)) {
      message.error("End date cannot be earlier than the start date.");
      return;
    }

    // Validate against schedule dates using utility functions
    if (Utils.isStartDateBeforeSchedule(scheduleStartDate, valid_from)) {
      message.error("Start date cannot be before the schedule start date.");
      return;
    }

    if (Utils.isEndDateAfterSchedule(scheduleEndDate, valid_to)) {
      message.error("End date cannot be after the schedule end date.");
      return;
    }
    if (isOffer) {
      // Dispatch the updated offer dates using the utility function
      Utils.dispatchOfferDates(
        dispatch,
        selectedItemForModal,
        valid_from,
        valid_to
      );
    } else {
      Utils.dispatchCouponDates(
        dispatch,
        selectedItemForModal,
        valid_from,
        valid_to
      );
    }
    form.resetFields();
    handleModalClose();
  };

  const disabledDate = (current) => {

    const isPastDate =
      current && current.isBefore(dayjs().startOf("day"), "day");

    // Disable dates outside schedule range
    const isBeforeScheduleStart =
      scheduleStartDate &&
      current.isBefore(dayjs(scheduleStartDate).startOf("day"), "day");
    const isAfterScheduleEnd =
      scheduleEndDate &&
      current.isAfter(dayjs(scheduleEndDate).endOf("day"), "day");

    return isPastDate || isBeforeScheduleStart || isAfterScheduleEnd;
  };

  // Validate end date based on selected start date
  const disabledEndDate = (current) => {
    const startDate = form.getFieldValue("valid_from");
    if (!startDate) {
      return disabledDate(current);
    }
    return disabledDate(current) || current.isBefore(startDate, "day");
  };

  return (
    <Modal
      title={selectedItemForModal ? selectedItemForModal.name : "Item Details"}
      open={isModalVisible}
      onCancel={() => {
        handleModalClose();
        form.resetFields();
      }}
      footer={null}
      destroyOnClose={true}
    >
      {selectedItemForModal && (
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <h3>{selectedItemForModal.name}</h3>
          <Form.Item
            label="Start Date"
            name="valid_from"
            rules={[
              { required: true, message: "Please select a start date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    scheduleStartDate &&
                    value &&
                    value.isBefore(dayjs(scheduleStartDate), "day")
                  ) {
                    return Promise.reject(
                      new Error("Start date must be within schedule period")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
              onChange={(date) => {
                form.setFieldsValue({ valid_from: date });
                form.setFieldsValue({ valid_to: null });
              }}
              showToday={false}
            />
          </Form.Item>
          <Form.Item
            label="End Date"
            name="valid_to"
            rules={[
              { required: true, message: "Please select an end date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("valid_from");
                  if (!startDate || !value) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(startDate, "day")) {
                    return Promise.reject(
                      new Error("End date must be after start date")
                    );
                  }
                  if (
                    scheduleEndDate &&
                    value.isAfter(dayjs(scheduleEndDate), "day")
                  ) {
                    return Promise.reject(
                      new Error("End date must be within schedule period")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={disabledEndDate}
              showToday={false}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default OfferDateModal;
