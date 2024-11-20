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

const venues = [
  "Auditorium A",
  "Auditorium B",
  "Party Hall",
  "Kozhikode Convention Center",
  "Conference Room",
  "Outdoor Stage",
  "Exhibition Hall",
  "Banquet Hall",
];

const categories = [
  "Movies",
  "Sports",
  "Entertainment",
  "Education",
  "Business",
  "Health",
  "Technology",
  "Art and Culture",
  "Music",
  "Theater",
];

const subCategories = [
  "Football",
  "Cricket",
  "Basketball",
  "Tennis",
  "Hockey",
  "Badminton",
  "Live Concerts",
  "Stand-up Comedy",
  "Workshops",
  "Seminars",
  "Exhibitions",
];

const status = [
  "Done",
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
  "On Hold",
  "Approved",
  "Rejected",
  "Draft",
  "Submitted",
  "Failed",
  "Processing",
];

const countries = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
];

const places = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Kozhikode",
  "Dubai",
  "London",
  "Toronto",
  "Sydney",
  "Tokyo",
  "Seoul",
  "Paris",
  "Mumbai",
  "Delhi",
  "Bangalore",
];

function CouponFormFields(props) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Coupon Details">

          <Form.Item
            name="couponName"
            label="Coupon Name"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Coupon Name" />
          </Form.Item>
          <Form.Item
            name="couponCode"
            label="Coupon Code"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Coupon Code" />
          </Form.Item>
          <Form.Item
            name="discountPercentage"
            label="Discount Percentage"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter discount percentage" />
          </Form.Item>

          <Form.Item name="startDate" label="Start Date" rules={rules.startDate}>
            <DatePicker className="w-100" placeholder="Select start date" />
          </Form.Item>

          <Form.Item name="endDate" label="End Date" rules={rules.endDate}>
            <DatePicker className="w-100" placeholder="Select end date" />
          </Form.Item>
          <Form.Item name="maxUsers" label="Max Users" rules={rules.maxUsers}>
            <Input type="number" placeholder="Enter maximum users" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={rules.status}>
            <Select className="w-100" placeholder="Select a status">
              {["active", "upcoming"].map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

      </Col>

    </Row>
  );
}

export default CouponFormFields;
