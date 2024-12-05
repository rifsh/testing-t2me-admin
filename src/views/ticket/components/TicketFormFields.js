import React, { useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  AutoComplete,
  Select,
  Switch,
  Button,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import venueListData from "assets/data/venue-list.json";

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
      message: "This field is required",
    },
  ],
};

const TicketFormFields = ({ form }) => {
  const [isTicketTypeEnable, setIsTicketTypeEnable] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ id: 1 }]);

  const addTicketTypeField = () => {
    setTicketTypes((prev) => [...prev, { id: prev.length + 1 }]);
  };

  const deleteTicketTypeField = (id) => {
    setTicketTypes((prev) => prev.filter((ticketType) => ticketType.id !== id));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Seat Details">
          <Form.Item name="venue" label="Venue" rules={rules.venue}>
            <Select className="w-100" placeholder="Select a Venue">
              {venueListData.map((venue) => (
                <Select.Option key={venue.venue} value={venue.venue}>
                  {venue.venue}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="basePrice" label="Base Ticket Price" rules={rules.section}>
            <Input placeholder="Enter Base Ticket Price" />
          </Form.Item>
          <Form.Item name="numberOfTickets" label="Total Number of Tickets" rules={rules.section}>
            <Input placeholder="Enter Number of Tickets" />
          </Form.Item>
          <Form.Item
            name="enableTicketType"
            label="Enable Ticket Type"
            valuePropName="checked"
          >
            <Switch
              checked={isTicketTypeEnable}
              onChange={(checked) => setIsTicketTypeEnable(checked)}
            />
          </Form.Item>
        </Card>

        {isTicketTypeEnable &&
          ticketTypes.map((ticketType, index) => (
            <div
              key={ticketType.id}
              style={{
                marginBottom: "24px",
                position: "relative",
              }}
            >
              <Card
                title={`Ticket Type Details ${index + 1}`}
                style={{
                  marginBottom: "8px",
                }}
              >
                <Form.Item
                  name={`ticketTypes[${index}].name`}
                  label="Ticket Type Name"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Ticket Type Name" />
                </Form.Item>
                <Form.Item
                  name={`ticketTypes[${index}].price`}
                  label="Ticket Price"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Ticket Price" />
                </Form.Item>
                <Form.Item
                  name={`ticketTypes[${index}].numberOfTickets`}
                  label="Number of Tickets"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Number of Tickets" />
                </Form.Item>
                <Form.Item
                  name={`ticketTypes[${index}].ticketSet`}
                  label="Ticket Set"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Ticket Set" />
                </Form.Item>
              </Card>
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteTicketTypeField(ticketType.id)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "-48px", 
                }}
              />
            </div>
          ))}
        {isTicketTypeEnable && (
          <Button
            type="dashed"
            onClick={addTicketTypeField}
            icon={<PlusOutlined />}
            style={{ width: "100%" }}
          >
            Add Ticket Type
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default TicketFormFields;
