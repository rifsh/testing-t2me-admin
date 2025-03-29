import React from "react";
import { Input, Row, Col, Card, Form, Alert, Select } from "antd";

function EventTypeFormFields({ form }) {
  const typeOptions = [];

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Type Details">
          <Form.Item
            name="name"
            label="Type Name"
            rules={[{ required: true, message: "Please select a type name" }]}
          >
            <Select
              placeholder="Select Type Name"
              options={typeOptions}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input placeholder="Enter Description" />
          </Form.Item>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={7}>
        <Card title="Event Information">
          <Alert
            message="Important Note"
            description="You can only select the number of items we provided, you can choose this while adding that item"
            type="warning"
            showIcon
            className="mb-4"
          />
        </Card>
      </Col>
    </Row>
  );
}

export default EventTypeFormFields;
