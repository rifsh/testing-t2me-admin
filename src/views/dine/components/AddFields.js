import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  TimePicker,
  InputNumber,
  Upload,
  Card,
  Row,
  Col,
  Divider,
  message,
  Space,
  Typography,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import moment from "moment";
import TextEditor from "components/util-components/FormItems/TextEditor";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { Tag } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AddFields = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const tableOptions = [
    { value: "2-seater", label: "2-Seater Table" },
    { value: "4-seater", label: "4-Seater Table" },
    { value: "6-seater", label: "6-Seater Table" },
  ];

  const [newTableType, setNewTableType] = useState(null);
  const [newTableQuantity, setNewTableQuantity] = useState(1);
  // Get current tables from form
  const tables = Form.useWatch("tables", form);

  // Add and remove table functions
  const handleAddTable = () => {
    if (!newTableType || !newTableQuantity) {
      message.error("Please select a table type and quantity");
      return;
    }

    const currentTables = form.getFieldValue("tables") || [];
    const newTables = [
      ...currentTables,
      { type: newTableType, quantity: newTableQuantity },
    ];

    form.setFieldsValue({ tables: newTables });
    setNewTableType(null);
    setNewTableQuantity(1);
  };

  const handleRemoveTable = (index) => {
    const currentTables = form.getFieldValue("tables") || [];
    const newTables = currentTables.filter((_, i) => i !== index);
    form.setFieldsValue({ tables: newTables });
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Format opening hours
      const formattedValues = {
        ...values,
        openingHours: `${values.openingHours[0].format(
          "HH:mm"
        )} - ${values.openingHours[1].format("HH:mm")}`,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Dining venue added successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Failed to add dining venue");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = ({ fileList }) => {
    console.log(fileList);
  };

  // Preview image
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Dummy function for image preview
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Generate initial tables setup
  const initialTableSetup = () => {
    const tableSetup = [];
    tableOptions.forEach((type) => {
      tableSetup.push({
        type: type.value,
        count: 0,
        capacity:
          type.value === "booth"
            ? 4
            : type.value === "highTop"
            ? 2
            : type.value === "barSeating"
            ? 1
            : type.value === "privateRoom"
            ? 8
            : 4,
      });
    });
    return tableSetup;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Card>
        <Title level={4}>Add New Dining Venue</Title>
        <Text type="secondary">
          Fill in the details below to add a new dining venue to your ticket
          booking system.
        </Text>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            reservationRequired: true,
            allowsWalkin: true,
            priceRange: "$$",
            capacity: 50,
            maximumPartySize: 8,
            openingHours: [moment("11:00", "HH:mm"), moment("22:00", "HH:mm")],
            tableSetup: initialTableSetup(),
          }}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Basic Information" key="basic">
              <Row gutter={24}>
                <Col xs={24} sm={24} md={16}>
                  <Form.Item
                    name="name"
                    label="Restaurant Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter restaurant name",
                      },
                    ]}
                  >
                    <Input
                      prefix={<ShopOutlined />}
                      placeholder="e.g. Ocean View Restaurant"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="tables"
                    label="Table Selection"
                    rules={[
                      {
                        required: true,
                        message: "Please add at least one table",
                      },
                    ]}
                  >
                    <div style={{ marginBottom: 8 }}>
                      {tables?.map((table, index) => {
                        const tableLabel = tableOptions.find(
                          (opt) => opt.value === table.type
                        )?.label;
                        return (
                          <Tag
                            key={index}
                            closable
                            onClose={() => handleRemoveTable(index)}
                            style={{ marginBottom: 4 }}
                          >
                            {tableLabel} x {table.quantity}
                          </Tag>
                        );
                      })}
                    </div>
                    <Space>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Select Table Type"
                        value={newTableType}
                        onChange={setNewTableType}
                      >
                        {tableOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                      <InputNumber
                        min={1}
                        value={newTableQuantity}
                        onChange={setNewTableQuantity}
                        placeholder="Quantity"
                      />
                      <Button
                        type="dashed"
                        onClick={handleAddTable}
                        icon={<PlusOutlined />}
                      >
                        Add Table
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      { required: true, message: "Please select status" },
                    ]}
                  >
                    <Select placeholder="Select status">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="maintenance">Maintenance</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item name="description" label="Description">
                    <TextEditor />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="location"
                    label="Location/Address"
                    rules={[
                      { required: true, message: "Please enter location" },
                    ]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="e.g. Main Hall, Level 2"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="openingHours"
                    label="Operating Hours"
                    rules={[
                      {
                        required: true,
                        message: "Please select operating hours",
                      },
                    ]}
                  >
                    <TimePicker.RangePicker
                      format="HH:mm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item name="phoneNumber" label="Contact Phone">
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="e.g. +1 234 567 8900"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    name="email"
                    label="Contact Email"
                    rules={[
                      {
                        type: "email",
                        message: "Please enter a valid email",
                      },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="e.g. restaurant@example.com"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item name="contactPerson" label="Contact Person">
                    <Input placeholder="e.g. John Smith" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Reservations & Settings" key="settings">
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="reservationTimeSlot"
                    label="Default Reservation Duration (minutes)"
                    initialValue={90}
                  >
                    <Select>
                      <Option value={30}>30 minutes</Option>
                      <Option value={60}>60 minutes</Option>
                      <Option value={90}>90 minutes</Option>
                      <Option value={120}>120 minutes</Option>
                      <Option value={150}>150 minutes</Option>
                      <Option value={180}>180 minutes</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    name="minAdvanceReservation"
                    label="Min. Advance Reservation (hours)"
                    initialValue={2}
                  >
                    <InputNumber min={0} max={48} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    name="maxAdvanceReservation"
                    label="Max. Advance Reservation (days)"
                    initialValue={30}
                  >
                    <InputNumber min={1} max={365} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item
                    name="reservationNotes"
                    label="Default Reservation Notes"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Any standard notes for reservations..."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Images & Media" key="media">
              <Form.Item
                name="mainImage"
                label="Main Image"
                valuePropName="fileList"
                getValueFromEvent={handleImageUpload}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  accept="image/*"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                name="galleryImages"
                label="Gallery Images"
                valuePropName="fileList"
                getValueFromEvent={handleImageUpload}
              >
                <Upload
                  listType="picture-card"
                  maxCount={5}
                  multiple
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  accept="image/*"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                name="menuPDF"
                label="Menu PDF (Optional)"
                valuePropName="fileList"
                getValueFromEvent={handleImageUpload}
              >
                <Upload maxCount={1} beforeUpload={() => false} accept=".pdf">
                  <Button icon={<UploadOutlined />}>Upload Menu PDF</Button>
                </Upload>
              </Form.Item>
            </TabPane>
          </Tabs>

          <Divider />

          <Row justify="end" style={{ marginTop: "20px" }}>
            <Space>
              <DiscardButton form={form} />
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!form.getFieldValue("venue_id")}
              >
                Submit
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddFields;
