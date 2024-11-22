import React from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Select,
} from "antd";
const { Option } = Select;

const rules = {
  name: [
    {
      required: true,
      message: "Please enter event name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter event description",
    },
  ],
  price: [
    {
      required: true,
      message: "Please enter event price",
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

const GeneralField = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={17}>
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
      <Card>
        <Form.Item name="category" label="Category">
          <Select className="w-100" placeholder="Choose a Category">
            {categories.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="subCategory" label="Sub Category">
          <Select className="w-100" placeholder="Choose a Sub Category">
            {subCategories.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select className="w-100" placeholder="Choose a Status">
            {status.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
    <Col xs={24} sm={24} md={7}>
      <Card title="Place Details">
        <Form.Item name="country" label="Country">
          <Select className="w-100" placeholder="Choose a Country">
            {countries.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="place" label="Place">
          <Select className="w-100" placeholder="Choose a Place">
            {places.map((elm) => (
              <Option key={elm} value={elm}>
                {elm}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="venue" label="Venue">
          <Select className="w-100" placeholder="Choose a Venue">
            {venues.map((venue) => (
              <Select.Option key={venue} value={venue}>
                {venue}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="eventDate"
          label="Event Date"
          rules={[{ required: true, message: "Please select a date!" }]}
        >
          <DatePicker className="w-100" placeholder="Choose a Date" />
        </Form.Item>
      </Card>
    </Col>
  </Row>
);

export default GeneralField;
