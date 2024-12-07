import { Card, Form, Input, Select } from "antd";
import React, { useState } from "react";
import couponListData from "assets/data/coupon-list.json";

const { Option } = Select;

const TicketField = () => {
  const rules = {
    ticketType: [{ required: true, message: "Please select a ticket type." }],
    ticket: [{ required: true, message: "Please select a ticket." }],
  };

  const [maxCapacity] = useState(1000);
  const [couponList] = useState(couponListData);

  const validateMaxTicket = (_, value) => {
    if (value === undefined || value === null || value === "") {
      return Promise.reject(new Error("Please enter the maximum number of tickets."));
    }
    if (isNaN(value)) {
      return Promise.reject(new Error("Please enter a valid number."));
    }
    if (value > maxCapacity) {
      return Promise.reject(new Error(`Max Ticket cannot exceed Max Capacity (${maxCapacity}).`));
    }
    return Promise.resolve();
  };

  return (
    <Card>
      <Form.Item name="maxCapacity" label="Max Capacity" initialValue={maxCapacity}>
        <Input readOnly />
      </Form.Item>

      <Form.Item
        name="maxTicket"
        label="Max Ticket"
        rules={[{ validator: validateMaxTicket }]}
      >
        <Input placeholder="Enter Max Ticket" type="number" />
      </Form.Item>

      <Form.Item name="ticketType" label="Ticket Type" rules={rules.ticketType}>
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
  );
};

export default TicketField;
