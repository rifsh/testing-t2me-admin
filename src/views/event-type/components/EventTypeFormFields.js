import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Alert, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventTypeOption } from "store/slices/eventSlice";

function EventTypeFormFields({ form, mode }) {
  const dispatch = useDispatch();
  const { type_option, loading } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchEventTypeOption());
   
  }, [dispatch]);

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Type Details">
          <Form.Item
            name="name"
            label="Type"
            rules={[{ required: true, message: "Please select a type name" }]}
          >
            <Select
              placeholder="Select Type Name"
              options={
                type_option?.map((item) => ({
                  label: item.option,
                  value: item.option,
                })) || []
              }
              allowClear
              loading={loading}
              disabled={loading || mode === "EDIT"}
            />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="Name"
            rules={[{ required: true, message: "Please enter a display name" }]}
          >
            <Input placeholder="Enter Display Name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea
              placeholder="Enter Description"
              rows={4}
              maxLength={500}
            />
          </Form.Item>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={7}>
        <Card title="Event Information">
          <Alert
            message="Important Note"
            description="You can only select the number of items we provided, you can choose this while adding that item"
            type="warning"
            showIcon
            className="mb-4"
          />
        </Card>
      </Col>
    </Row>
  );
}

export default EventTypeFormFields;
