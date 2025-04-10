import React from "react";
import {
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  InputNumber,
  Divider,
  Typography,
  Button,
  Space,
  message,
} from "antd";
import { useSelector } from "react-redux";
import LoadingOverlay from "components/util-components/Loader";

const { Option } = Select;
const { Title } = Typography;

const TableCreationForm = ({ onFinish }) => {
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.movie);

  const handleSubmit = (values) => {
    try {
      if (onFinish) {
        onFinish(values);
      }
      message.success("Table details submitted successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit table details");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Card title={<Title level={4}>Table Details</Title>} bordered>
        <Divider />
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="Table Name"
                rules={[{ required: true, message: "Please enter table name" }]}
              >
                <Input placeholder="Enter Table name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="seat"
                label="Seat capacity"
                rules={[{ required: true, message: "Enter Seat Capacity" }]}
              >
                <InputNumber min={1} max={300} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="table_type"
                label="Dining Type"
                rules={[
                  { required: true, message: "Please enter dining type" },
                ]}
              >
                <Input placeholder="Enter Dining Type" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[
                  { required: true, message: "Please select location type" },
                ]}
              >
                <Select placeholder="Select location">
                  <Option value="indoor">Indoor</Option>
                  <Option value="outdoor">Outdoor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default TableCreationForm;
