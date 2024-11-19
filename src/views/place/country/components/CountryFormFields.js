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

const CountryFormFields = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={17}>
      <Card title="Basic Info">
        <Form.Item name="country" label="Country name" rules={rules.country}>
          <Select className="w-100" placeholder="Choose a Country">
            {countries.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="Place" label="Place" rules={rules.name}>
          <Input placeholder="Place Name" />
        </Form.Item>
       
      </Card>
      
    </Col>
    
  </Row>
);

export default CountryFormFields;
