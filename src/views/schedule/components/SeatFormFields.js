import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select, Radio } from "antd";

const { Option } = Select;

const rules = {
  event: [
    {
      required: true,
      message: "Please select an event",
    },
  ],
  start_time: [
    {
      required: true,
      message: "Please select a start time",
    },
  ],
  end_time: [
    {
      required: true,
      message: "Please select an end time",
    },
  ],
  status: [
    {
      required: true,
      message: "Please select status",
    },
  ],
  venue: [
    {
      required: true,
      message: "Please select a venue",
    },
  ],
};

const statuses = ["Active", "Inactive"];
const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}


function ScheduleFormFields() {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Schedule Details">
        <Form.Item name="event" label="event" rules={rules.event}>
          <Input placeholder="Event Name" />
        </Form.Item>
       
         

          <Form.Item name="start_time" label="Start Time" rules={rules.start_time}>
            <DatePicker
              showTime
              className="w-100"
              placeholder="Select start time"
            />
          </Form.Item>

          <Form.Item name="end_time" label="End Time" rules={rules.end_time}>
            <DatePicker
              showTime
              className="w-100"
              placeholder="Select end time"
            />
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" label="Status" rules={rules.status}>
            <Select className="w-100" placeholder="Select status">
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Select
    mode="multiple"
    style={{ width: '100%' }}
    placeholder="Please select"
    defaultValue={['a10', 'c12']}
    onChange={handleChange}
  >
    {children}
  </Select>,
         
        </Card>
      </Col>
    </Row>
  );
}

export default ScheduleFormFields;
