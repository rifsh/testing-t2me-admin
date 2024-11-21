import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select } from "antd";
const { Option } = Select;

const rules = {
  email: [
    {
      required: true,
      message: "Please enter email address",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter user name",
    },
  ],
  role: [
    {
      required: true,
      message: "Please select a role",
    },
  ],
  status: [
    {
      required: true,
      message: "Please select a status",
    },
  ]
};

const status = [
  "Active",
  "In Active"
];
const role = [
  "Manager",
  "Employee"
];


function CouponFormFields(props) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="User Details">

          <Form.Item
            name="userName"
            label="User Name"
            rules={rules.name}
          >
            <Input placeholder="Enter User Name" />
          </Form.Item>
          <Form.Item
            name="emailAddress"
            label="Email Address"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter Email Address" />
          </Form.Item>
          <Form.Item name="role" label="role" rules={rules.status}>
            <Select className="w-100" placeholder="Select a Role">
              {role.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={rules.status}>
            <Select className="w-100" placeholder="Select a status">
              {status.map((status) => (
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
