import React from "react";
import { 
  Card, 
  Col, 
  Form, 
  Select, 
  Row, 
  Typography, 
  Input, 
  DatePicker, 
  InputNumber, 
  Button, 
  Space 
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

const EventBookingInfo = ({ form }) => {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Event Booking Information">
          {/* Basic Event Information */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="event_name"
                label="Event Name"
                rules={[{ required: true, message: "Please enter event name" }]}
              >
                <Input placeholder="Enter event name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="event_date"
                label="Event Date"
                rules={[{ required: true, message: "Please select event date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="venue"
                label="Venue"
                rules={[{ required: true, message: "Please enter venue" }]}
              >
                <Input placeholder="Enter venue location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="attendees_count"
                label="Number of Attendees"
                rules={[{ required: true, message: "Please enter number of attendees" }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="Enter number of attendees" 
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Dynamic Services List */}
          <Form.List name="services">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0 }}>Services Required</Title>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginLeft: "auto" }}
                  >
                    Add Service
                  </Button>
                </div>
                
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: 8 }}
                    extra={
                      <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        danger
                      />
                    }
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "service_type"]}
                          label="Service Type"
                          rules={[{ required: true, message: "Select service type" }]}
                        >
                          <Select placeholder="Select service">
                            <Option value="catering">Catering</Option>
                            <Option value="decoration">Decoration</Option>
                            <Option value="photography">Photography</Option>
                            <Option value="music">Music/DJ</Option>
                            <Option value="transport">Transportation</Option>
                            <Option value="security">Security</Option>
                            <Option value="cleaning">Cleaning</Option>
                            <Option value="other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "description"]}
                          label="Description"
                          rules={[{ required: true, message: "Enter description" }]}
                        >
                          <Input placeholder="Service description" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "cost"]}
                          label="Estimated Cost"
                        >
                          <InputNumber
                            prefix="$"
                            placeholder="0.00"
                            style={{ width: "100%" }}
                            min={0}
                            step={0.01}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                
                {fields.length === 0 && (
                  <Card size="small" style={{ textAlign: "center", marginBottom: 16 }}>
                    <Text type="secondary">No services added yet. Click "Add Service" to get started.</Text>
                  </Card>
                )}
              </>
            )}
          </Form.List>

          {/* Dynamic Requirements List */}
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16, marginTop: 24 }}>
                  <Title level={5} style={{ margin: 0 }}>Special Requirements</Title>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginLeft: "auto" }}
                  >
                    Add Requirement
                  </Button>
                </div>
                
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "requirement"]}
                      rules={[{ required: true, message: "Enter requirement" }]}
                      style={{ flex: 1, margin: 0 }}
                    >
                      <Input placeholder="Enter special requirement" />
                    </Form.Item>
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      danger
                    />
                  </Space>
                ))}
                
                {fields.length === 0 && (
                  <Card size="small" style={{ textAlign: "center", marginBottom: 16 }}>
                    <Text type="secondary">No special requirements added.</Text>
                  </Card>
                )}
              </>
            )}
          </Form.List>

          {/* Tax Information */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} sm={12}>
              <Form.Item name="tax_rate" label="Tax Rate (%)">
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="Enter tax rate"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="tax_type" label="Tax Type">
                <Select placeholder="Select tax type">
                  <Option value="vat">VAT</Option>
                  <Option value="gst">GST</Option>
                  <Option value="sales_tax">Sales Tax</Option>
                  <Option value="service_tax">Service Tax</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Additional Notes */}
          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea
              rows={4}
              placeholder="Enter any additional notes or comments about the booking"
            />
          </Form.Item>
        </Card>
      </Col>
      
      {/* Summary or Additional Information Sidebar */}
      <Col xs={24} sm={24} md={7}>
        <Card title="Booking Summary" size="small">
          <Text type="secondary">
            Complete the form to see booking summary
          </Text>
        </Card>
      </Col>
    </Row>
  );
};

export default EventBookingInfo;