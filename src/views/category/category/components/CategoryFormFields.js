import React from "react";
import { Input, Row, Col, Card, Form, Button } from "antd";

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter country description",
    },
  ],
  price: [
    {
      required: true,
      message: "Please enter country price",
    },
  ],
  comparePrice: [],
  taxRate: [
    {
      required: true,
      message: "Please enter tax rate",
    },
  ],
  cost: [
    {
      required: true,
      message: "Please enter item cost",
    },
  ],
};

const CategoryFormFields = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={17}>
      <Card title="Basic Info">
        <Form.Item name="category" label="Category" rules={rules.name}>
          <Input placeholder="Category" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={rules.description}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Button style={{ marginRight: 10 }}>Discard</Button>
          <Button type="primary">Add</Button>
        </div>
      </Card>
    </Col>
  </Row>
);

export default CategoryFormFields;
