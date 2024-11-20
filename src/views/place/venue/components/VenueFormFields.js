import React from "react";
import { Input, Row, Col, Card, Form, Select } from "antd";
const { Option } = Select;

const rules = {
  address: [
    {
      required: true,
      message: "Please enter the address",
    },
  ],
  city: [
    {
      required: true,
      message: "Please enter the city",
    },
  ],
  venue: [
    {
      required: true,
      message: "Please enter the venue name",
    },
  ],
  place: [
    {
      required: true,
      message: "Please select a place",
    },
  ],
  capacity: [
    {
      required: true,
      message: "Please enter the capacity",
    },
  ],
  indoor: [
    {
      required: true,
      message: "Please specify if the venue is indoor or outdoor",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter a description",
    },
  ],
};

const Places = [
  "Auditorium A",
  "Auditorium B",
  "Party Hall",
  "Kozhikode Convention Center",
  "Conference Room",
  "Outdoor Stage",
  "Exhibition Hall",
  "Banquet Hall",
];

const VenueFormFields = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={17}>
      <Card title="Venue Details">
        {/* 1. Address */}
        <Form.Item name="address" label="Address" rules={rules.address}>
          <Input placeholder="Enter the address" />
        </Form.Item>

        {/* 2. City */}
        <Form.Item name="city" label="City" rules={rules.city}>
          <Input placeholder="Enter the city" />
        </Form.Item>

        {/* 3. Place */}
        <Form.Item name="place" label="Place" rules={rules.place}>
          <Select className="w-100" placeholder="Select a Place">
            {Places.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* 4. Venue */}
        <Form.Item name="venue" label="Venue" rules={rules.venue}>
          <Input placeholder="Enter the venue name" />
        </Form.Item>

        {/* 5. Capacity */}
        <Form.Item name="capacity" label="Capacity" rules={rules.capacity}>
          <Input type="number" placeholder="Enter capacity" />
        </Form.Item>

        {/* 6. Indoor/Outdoor */}
        <Form.Item name="indoor" label="Indoor/Outdoor" rules={rules.indoor}>
          <Select className="w-100" placeholder="Select type">
            <Option value="indoor">Indoor</Option>
            <Option value="outdoor">Outdoor</Option>
          </Select>
        </Form.Item>

        {/* 7. Description */}
        <Form.Item name="description" label="Description" rules={rules.description}>
          <Input.TextArea rows={4} placeholder="Enter a description" />
        </Form.Item>
      </Card>
    </Col>
  </Row>
);

export default VenueFormFields;
