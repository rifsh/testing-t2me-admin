import React, { useEffect } from "react";
import { Modal, Form, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import { OfferDateValidation } from "../utils/OfferDateValidation";

export const DateChangeModal = ({
  isVisible,
  onClose,
  onSave,
  item,
  scheduleStartDate,
  scheduleEndDate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isVisible && item) {
      const itemData = item.offer ?? item.coupons; // Ensures a valid object is selected

      if (
        itemData &&
        dayjs(itemData.start_date).isValid() &&
        dayjs(itemData.end_date).isValid()
      ) {
        form.setFieldsValue({
          start_date: dayjs(itemData.start_date),
          end_date: dayjs(itemData.end_date),
        });
      }
    } else {
      form.resetFields();
    }
  }, [isVisible, item, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const itemData = item.offer || item.coupons;

      // Get original dates from the item
      const originalDates = {
        start_date: itemData.original_start_date || itemData.start_date,
        end_date: itemData.original_end_date || itemData.end_date,
      };

      // Validate the selected dates
      const validationResult = OfferDateValidation.validateDates({
        startDate: values.start_date.format("YYYY-MM-DD"),
        endDate: values.end_date.format("YYYY-MM-DD"),
        scheduleStartDate,
        scheduleEndDate,
        originalItemDates: originalDates,
        isRequired: true,
        itemName: item.offer ? "Offer" : "Coupon",
      });

      if (!validationResult.isValid) {
        message.error(validationResult.message);
        return;
      }

      // If dates were adjusted, use the adjusted dates
      const datesToSave = validationResult.wasAdjusted
        ? validationResult.adjustedDates
        : {
            start_date: values.start_date.format("YYYY-MM-DD"),
            end_date: values.end_date.format("YYYY-MM-DD"),
          };

      // Show warning if dates were adjusted
      if (validationResult.wasAdjusted) {
        message.warning(validationResult.message);
      }

      // Prepare the updated item data
      const updatedData = {
        start_date: datesToSave.start_date,
        end_date: datesToSave.end_date,
      };

      if (item.offer) {
        updatedData.id = item.offer.id;
      } else if (item.coupons) {
        updatedData.id = item.coupons.id;
      }

      // If there were original dates to be preserved
      if (validationResult.wasAdjusted || itemData.original_start_date) {
        updatedData.original_start_date = originalDates.start_date;
        updatedData.original_end_date = originalDates.end_date;
      }

      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const getDisabledDates = () => {
    if (!item) return () => false;

    const itemData = item.offer || item.coupons;
    return OfferDateValidation.getDisabledDate(
      scheduleStartDate,
      scheduleEndDate,
      {
        start_date: itemData.original_start_date || itemData.start_date,
        end_date: itemData.original_end_date || itemData.end_date,
      }
    );
  };

  return (
    <Modal
      title={`Change ${item?.offer ? "Offer" : "Coupon"} Date Range`}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="start_date"
          label="Start Date"
          rules={[
            { required: true, message: "Please select start date" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const endDate = getFieldValue("end_date");
                if (endDate && value.isAfter(endDate, "day")) {
                  return Promise.reject(
                    new Error("Start date cannot be after end date")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={getDisabledDates()}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item
          name="end_date"
          label="End Date"
          rules={[
            { required: true, message: "Please select end date" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const startDate = getFieldValue("start_date");
                if (startDate && value.isBefore(startDate, "day")) {
                  return Promise.reject(
                    new Error("End date cannot be before start date")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={getDisabledDates()}
            format="YYYY-MM-DD"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
