import React from "react";
import { Card, Form, Row, Col, Select, TimePicker } from "antd";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WorkingPeriodForm = () => {
  return (
    <Card title="Working Period">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="start_day"
            label="Start Day"
            rules={[
              {
                required: true,
                message: "Please select start day",
              },
            ]}
          >
            <Select placeholder="Select Start Day">
              {WEEK_DAYS.map((day) => (
                <Select.Option key={day} value={day}>
                  {day}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="end_day"
            label="End Day"
            rules={[
              {
                required: true,
                message: "Please select end day",
              },
            ]}
          >
            <Select placeholder="Select End Day">
              {WEEK_DAYS.map((day) => (
                <Select.Option key={day} value={day}>
                  {day}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[
              {
                required: true,
                message: "Please select start time",
              },
            ]}
          >
            <TimePicker format="HH:mm" placeholder="Start Time" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="end_time"
            label="End Time"
            rules={[
              {
                required: true,
                message: "Please select end time",
              },
            ]}
          >
            <TimePicker format="HH:mm" placeholder="End Time" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default WorkingPeriodForm;