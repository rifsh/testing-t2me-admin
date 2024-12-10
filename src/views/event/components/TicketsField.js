import { Card, Col, Form, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import couponListData from "assets/data/coupon-list.json";
import { useSelector } from "react-redux";

const { Option } = Select;

const TicketField = ({ form }) => {
  const rules = {
    ticketType: [{ required: true, message: "Please select a ticket type." }],
    ticket: [{ required: true, message: "Please select a ticket." }],
  };

  const { selectedVenue } = useSelector((state) => state.locations);
  const [couponList] = useState(couponListData);

  useEffect(() => {
    if (selectedVenue?.capacity) {
      form.setFieldsValue({
        maxCapacity: selectedVenue.capacity,
      });
    }
  }, [selectedVenue, form]);

  const validateMaxTicket = (_, value) => {
    if (!value) {
      return Promise.reject(
        new Error("Please enter the maximum number of tickets.")
      );
    }
    if (isNaN(value)) {
      return Promise.reject(new Error("Please enter a valid number."));
    }
    if (value > selectedVenue.capacity) {
      return Promise.reject(
        new Error(`Max Ticket cannot exceed Max Capacity (${selectedVenue.capacity}).`)
      );
    }
    return Promise.resolve();
  };

  return (
    <Col xs={24} sm={24} md={17}>
      <Card title="Ticket Details">
        
        <Form.Item
          name="maxCapacity"
          label="Max Capacity"
          initialValue={selectedVenue?.capacity}
        >
          <Input readOnly />
        </Form.Item>

        <Form.Item
          name="maxTicket"
          label="Max Ticket"
          rules={[{ validator: validateMaxTicket }]}
        >
          <Input placeholder="Enter Max Ticket" type="number" />
        </Form.Item>

        <Form.Item
          name="ticketType"
          label="Ticket Type"
          rules={rules.ticketType}
        >
          <Select className="w-100" placeholder="Choose a Ticket Type">
            {couponList.map((elm) => (
              <Option key={elm.couponName} value={elm.couponName}>
                {elm.couponName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="ticket" label="Ticket" rules={rules.ticket}>
          <Select className="w-100" placeholder="Choose a Ticket">
            {couponList.map((elm) => (
              <Option key={elm.couponName} value={elm.couponName}>
                {elm.couponName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default TicketField;
