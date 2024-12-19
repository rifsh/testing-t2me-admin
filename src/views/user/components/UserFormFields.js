import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRoles, setSelectedRole } from "store/slices/userSlice";
import { fetchAllEvent } from "store/slices/eventSlice";

const { Option } = Select;

const rules = {
  email: [
    {
      required: true,
      message: "Please enter an email address",
    },
    {
      type: "email",
      message: "Please enter a valid email address",
    },
  ],
  password: [
    {
      required: true,
      message: "Please enter password",
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
};

function CouponFormFields() {
  const dispatch = useDispatch();
  const { roles, loading, selectedRole } = useSelector((state) => state.users);
  const { filteredEvents, loading: eventLoading } = useSelector(
    (state) => state.event
  );

  useEffect(() => {
    dispatch(fetchAllRoles());
  }, [dispatch]);

  const handleSelectedRole = (role) => {
    dispatch(setSelectedRole(role));
    if (role === "event organizer") {
      dispatch(fetchAllEvent());
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="User Details">
          <Form.Item name="username" label="User Name" rules={rules.name}>
            <Input placeholder="Enter User Name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={rules.email}
          >
            <Input placeholder="Enter Email Address" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={rules.password}>
            <Input placeholder="Enter Password" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={rules.role}>
            <Select
              className="w-100"
              placeholder="Select a Role"
              loading={loading}
              onChange={(value) => handleSelectedRole(value)}
            >
              {roles.map((role) => (
                <Option key={role.name} value={role.name}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedRole === "event organizer" && (
            <Form.Item name="events" label="Events">
              <Select mode="multiple"
                loading={eventLoading}
                style={{ width: "100%" }}
                placeholder="Please select"
              >
                {filteredEvents.map((event) => (
                  <Option key={event.id} value={event.id}>
                    {event.event_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Card>
      </Col>

    </Row>
  );
}

export default CouponFormFields;
