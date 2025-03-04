import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Select,
  Col,
  Row,
  Radio,
  Tabs,
  message,
} from "antd";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { SERVICE_TYPE } from "constants/PaymentConstants";

const { TextArea } = Input;
const { Option } = Select;

const AddOnServicesForm = ({ form }) => {
  const MAX_FIELDS_PER_ROW = 3;
  const [activeKey, setActiveKey] = useState("0");
  const getServiceCount = () => {
    const services = form.getFieldValue("services") || [];
    return services.length;
  };

  const onChange = (key) => {
    setActiveKey(key);
  };

  const addTab = () => {
    const services = form.getFieldValue("services") || [];
    const newServices = [...services, {}];
    form.setFieldsValue({ services: newServices });
    setActiveKey(String(services.length));
  };

  const removeTab = (targetKey) => {
    const services = form.getFieldValue("services") || [];

    // Don't remove if there's only one service
    if (services.length <= 1) {
      message.warning("At least one service is required");
      return;
    }

    const newServices = services.filter(
      (_, index) => index !== Number(targetKey)
    );
    form.setFieldsValue({ services: newServices });

    if (activeKey === targetKey) {
      const newActiveKey =
        targetKey === "0" ? "0" : String(Number(targetKey) - 1);
      setActiveKey(newActiveKey >= 0 ? newActiveKey : "0");
    }
  };

  const checkDuplicateServiceType = (index, value) => {
    const services = form.getFieldValue("services") || [];

    const duplicateFound = services.some(
      (service, i) => i !== index && service && service.service_name === value
    );

    if (duplicateFound) {
      message.error(
        "This service type is already added. Please select a different one."
      );

      // Create a copy of all current services
      const updatedServices = [...services];

      // Only remove the service_name field from the current item, preserving other fields
      if (updatedServices[index]) {
        updatedServices[index] = {
          ...updatedServices[index],
          service_name: undefined, // Set to undefined instead of deleting
        };
      }

      // Force select element to clear its value visually
      setTimeout(() => {
        form.setFieldsValue({
          services: updatedServices,
        });
      }, 0);

      return false;
    }

    return true;
  };

  const handleServiceTypeChange = (index, value) => {
    if (!checkDuplicateServiceType(index, value)) {
      return;
    }

    // When service type changes, preserve other fields
    const services = form.getFieldValue("services") || [];
    const currentValues = services[index] || {};

    const newValues = {
      ...currentValues,
      service_name: value,
    };

    // Update just this specific service
    const updatedServices = [...services];
    updatedServices[index] = newValues;

    form.setFieldsValue({
      services: updatedServices,
    });
  };

  const getTabItems = () => {
    const services = form.getFieldValue("services") || [];
    return services.map((_, index) => ({
      key: String(index),
      label: `Service ${index + 1}`,
      children: renderServiceForm(index),
      closeIcon: services.length > 1 && (
        <MinusCircleOutlined
          onClick={(e) => {
            e.stopPropagation();
            removeTab(String(index));
          }}
        />
      ),
    }));
  };

  const renderServiceForm = (name) => {
    return (
      <div className="p-4">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Service Type"
              name={["services", name, "service_name"]}
              rules={[
                {
                  required: true,
                  message: "Service type is required",
                },
              ]}
            >
              <Select
                placeholder="Select service type"
                onChange={(value) => handleServiceTypeChange(name, value)}
              >
                {SERVICE_TYPE.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["services", name, "is_percentage"]}
              label="Service charge Type"
              initialValue={false}
            >
              <Radio.Group>
                <Radio value={true}>Percentage</Radio>
                <Radio value={false}>Amount</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                return (
                  prevValues.services?.[name]?.is_percentage !==
                  currentValues.services?.[name]?.is_percentage
                );
              }}
            >
              {({ getFieldValue }) => {
                const isPercentage = getFieldValue([
                  "services",
                  name,
                  "is_percentage",
                ]);

                if (isPercentage === true) {
                  return (
                    <Form.Item
                      name={["services", name, "percentage_or_amount"]}
                      label="Service Charge Percentage"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Service Charge percentage",
                        },
                        {
                          type: "number",
                          min: 0,
                          max: 100,
                          message: "Discount must be between 0 and 100",
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter Service Charge percentage"
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        formatter={(value) => `${value}`}
                        parser={(value) => value.replace("", "")}
                      />
                    </Form.Item>
                  );
                }

                return (
                  <Form.Item
                    name={["services", name, "percentage_or_amount"]}
                    label="Service Charge Amount"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Service Charge amount",
                      },
                      {
                        type: "number",
                        min: 0,
                        message:
                          "Discount amount must be greater than or equal to 0",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter Service Charge amount"
                      min={0}
                      formatter={(value) => `${value}`}
                      parser={(value) => value.replace("", "")}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Service Description"
          name={["services", name, "description"]}
          rules={[{ required: true, message: "Description is required" }]}
        >
          <TextArea placeholder="Describe what this service offers" rows={3} />
        </Form.Item>

        <Form.Item label="Service Features">
          <Form.List name={["services", name, "features"]}>
            {(featureFields, { add: addFeature, remove: removeFeature }) => {
              const rows = [];
              let currentRow = [];

              featureFields.forEach((field) => {
                currentRow.push(field);

                if (currentRow.length === MAX_FIELDS_PER_ROW) {
                  rows.push([...currentRow]);
                  currentRow = [];
                }
              });

              if (currentRow.length > 0) {
                rows.push(currentRow);
              }

              return (
                <div>
                  {rows.map((row, rowIndex) => (
                    <Row
                      gutter={8}
                      key={`row-${rowIndex}`}
                      style={{ marginBottom: "8px" }}
                    >
                      {row.map((field) => (
                        <Col
                          key={field.key}
                          xs={24}
                          sm={8}
                          style={{ marginBottom: "8px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Form.Item
                              {...field}
                              name={[field.name]}
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter feature text",
                                },
                              ]}
                              style={{ marginBottom: 0, flex: 1 }}
                            >
                              <Input placeholder="Feature" />
                            </Form.Item>

                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeFeature(field.name)}
                              style={{ marginLeft: "8px" }}
                            />
                          </div>
                        </Col>
                      ))}

                      {row.length < MAX_FIELDS_PER_ROW &&
                        rowIndex === rows.length - 1 && (
                          <Col xs={24} sm={8}>
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => addFeature()}
                            >
                              Add Feature
                            </Button>
                          </Col>
                        )}
                    </Row>
                  ))}

                  {(rows.length === 0 ||
                    (rows.length > 0 &&
                      rows[rows.length - 1].length === MAX_FIELDS_PER_ROW)) && (
                    <Row>
                      <Col>
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => addFeature()}
                          style={{ marginTop: "4px" }}
                        >
                          Add Feature
                        </Button>
                      </Col>
                    </Row>
                  )}
                </div>
              );
            }}
          </Form.List>
        </Form.Item>
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 mb-6" title="Add-On Services">
      <Form form={form} layout="vertical">
        <Form.Item name="services" initialValue={[{}]} noStyle />

        <Tabs
          type="editable-card"
          onChange={onChange}
          activeKey={activeKey}
          onEdit={(targetKey, action) => {
            if (action === "add") {
              addTab();
            }
          }}
          items={getTabItems()}
          addIcon={<PlusOutlined />}
        />
      </Form>
    </Card>
  );
};

export default AddOnServicesForm;
