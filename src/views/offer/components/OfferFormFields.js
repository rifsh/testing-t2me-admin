import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select } from "antd";
const { Option } = Select;

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

function OfferFormFields(props) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details">
          <Form.Item
            name="name"
            label="Offer Name"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Offer Name" />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter discount percentage" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
            rules={rules.startDate}
          >
            <DatePicker
              className="w-100"
              placeholder="Select start date"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item name="end_date" label="End Date" rules={rules.endDate}>
            <DatePicker
              className="w-100"
              placeholder="Select end date"
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item name="max_uses" label="Max Users" rules={rules.maxUsers}>
            <Input type="number" placeholder="Enter maximum users" />
          </Form.Item>
          {/* <Form.Item name="status" label="Status" rules={rules.status}>
            <Select className="w-100" placeholder="Select a status">
              {["active", "upcoming"].map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
        </Card>
      </Col>
    </Row>
  );
}

export default OfferFormFields;
