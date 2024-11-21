import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select, Radio } from "antd";

const { Option } = Select;

const rules = {
  venue: [
    {
      required: true,
      message: "Please select a venue",
    },
  ],
  section: [
    {
      required: true,
      message: "Please enter a section",
    },
  ],
  row: [
    {
      required: true,
      message: "Please enter a row",
    },
  ],
  seat_number: [
    {
      required: true,
      message: "Please enter a seat number",
    },
  ],
  price_modifier: [
    {
      required: true,
      message: "Please enter a price modifier",
    },
  ],
  is_available: [
    {
      required: true,
      message: "Please select availability",
    },
  ],
  is_accessible: [
    {
      required: true,
      message: "Please select accessibility",
    },
  ],
  book_status: [
    {
      required: true,
      message: "Please select booking status",
    },
  ],
  status: [
    {
      required: true,
      message: "Please select status",
    },
  ],
  last_cleaned: [
    {
      required: true,
      message: "Please select the last cleaned date",
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

const bookingStatuses = ["Booked", "Available", "Reserved"];
const seatStatuses = ["Occupied", "Vacant"];

function SeatFormFields() {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Seat Details">
          <Form.Item name="venue" label="Venue" rules={rules.venue}>
            <Select className="w-100" placeholder="Select a venue">
              {venues.map((venue) => (
                <Option key={venue} value={venue}>
                  {venue}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="section" label="Section" rules={rules.section}>
            <Input placeholder="Enter section" />
          </Form.Item>

          <Form.Item name="row" label="Row" rules={rules.row}>
            <Input placeholder="Enter row number" />
          </Form.Item>

          <Form.Item
            name="seat_number"
            label="Seat Number"
            rules={rules.seat_number}
          >
            <Input placeholder="Enter seat number" />
          </Form.Item>

          <Form.Item
            name="price_modifier"
            label="Price Modifier"
            rules={rules.price_modifier}
          >
            <Input type="number" placeholder="Enter price modifier" />
          </Form.Item>

          <Form.Item
            name="is_available"
            label="Is Available"
            rules={rules.is_available}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="is_accessible"
            label="Is Accessible"
            rules={rules.is_accessible}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="book_status"
            label="Booking Status"
            rules={rules.book_status}
          >
            <Select className="w-100" placeholder="Select booking status">
              {bookingStatuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={rules.status}>
            <Select className="w-100" placeholder="Select seat status">
              {seatStatuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="last_cleaned"
            label="Last Cleaned"
            rules={rules.last_cleaned}
          >
            <DatePicker className="w-100" placeholder="Select last cleaned date" />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
}

export default SeatFormFields;
