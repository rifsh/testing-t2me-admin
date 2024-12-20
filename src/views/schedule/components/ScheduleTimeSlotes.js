import React from "react";
import { Card, Form, DatePicker } from "antd";
import dayjs from "dayjs";

export function ScheduleTimeSlots({ form }) {
  return (
    <Card title="Schedule Details">
      <Form.Item
        name="start_date"
        label="Start Time"
        rules={[
          { required: true, message: "Please select start time" },
          {
            validator(_, value) {
              if (value && value.isBefore(dayjs(), 'minute')) {
                return Promise.reject(new Error("Start time cannot be in the past"));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker
          showTime
          className="w-100"
          placeholder="Select start time"
          disabledDate={(current) => current && current < dayjs().endOf('day')}
        />
      </Form.Item>

      <Form.Item
        name="end_date"
        label="End Time"
        rules={[
          { required: true, message: "Please select end time" },
          {
            validator(_, value) {
              const startDate = dayjs(form.getFieldValue('start_date'));
              if (value && value.isBefore(dayjs(), 'minute')) {
                return Promise.reject(new Error("End time cannot be in the past"));
              }
              if (startDate && value && value.isBefore(startDate)) {
                return Promise.reject(new Error("End time must be after start time"));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker
          showTime
          className="w-100"
          placeholder="Select end time"
          disabledDate={(current) => current && current < dayjs().endOf('day')}
        />
      </Form.Item>
    </Card>
  );
}
