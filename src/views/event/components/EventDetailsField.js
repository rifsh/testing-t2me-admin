import { Card, Col, Form, Input, message } from "antd";
import React from "react";

const EventDetailsField = () => {
  const rules = {
    name: [{ required: true, message: "Please enter event name" }],
    description: [
      {
        required: true,
        message: "Please enter event description",
      },
    ],
  };
  return (
    <div>
      <Col>
        <Card title="Event Info">
          <Form.Item name="name" label="Event name" rules={rules.name}>
            <Input placeholder="Event Name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={rules.description}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Card>
      </Col>
    </div>
  );
};

export default EventDetailsField;
