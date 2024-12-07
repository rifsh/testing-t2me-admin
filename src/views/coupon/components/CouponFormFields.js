import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, } from "antd";


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

function CouponFormFields(props) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Coupon Details">
          <Form.Item
            name="name"
            label="Coupon Name"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Coupon Name" />
          </Form.Item>
          <Form.Item
            name="coupon_code"
            label="Coupon Code"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Coupon Code" />
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
          <Form.Item name="min_purchase_amount" label="Min Purchase Amount" rules={rules.maxUsers}>
            <Input type="number" placeholder="Enter min purchase amount" />
          </Form.Item>
          
        </Card>
      </Col>
    </Row>
  );
}

export default CouponFormFields;
