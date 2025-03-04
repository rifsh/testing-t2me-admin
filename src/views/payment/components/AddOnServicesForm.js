import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Col,
  Row,
  Radio,
  Tabs,
  message,
  Empty,
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
  const [hasServices, setHasServices] = useState(true);
  const [tabKey, setTabKey] = useState(0); // Added to force re-render

  useEffect(() => {
    const add_on_services = form.getFieldValue("add_on_services") || [];
    setHasServices(add_on_services.length > 0);
  }, [form]);

  const addTab = () => {
    const add_on_services = form.getFieldValue("add_on_services") || [];
    const newServices = [...add_on_services, {}];
    form.setFieldsValue({ add_on_services: newServices });
    setActiveKey(String(add_on_services.length));
    setHasServices(true);
    setTabKey((prev) => prev + 1); // Increment to force re-render
  };

  const removeTab = (targetKey) => {
    const add_on_services = form.getFieldValue("add_on_services") || [];
    const targetIndex = Number(targetKey);

    if (add_on_services.length <= 1) {
      form.setFieldsValue({ add_on_services: [] });
      setHasServices(false);
      setActiveKey("0");
    } else {
      const newServices = add_on_services.filter(
        (_, index) => index !== targetIndex
      );
      form.setFieldsValue({ add_on_services: newServices });
      const newActiveKey =
        targetIndex <= Number(activeKey)
          ? String(Math.max(0, Number(activeKey) - 1))
          : activeKey;
      setActiveKey(newActiveKey);
      setHasServices(true);
    }

    setTabKey((prev) => prev + 1); // Force Tabs to re-render
  };

  const checkDuplicateServiceType = (index, value) => {
    const add_on_services = form.getFieldValue("add_on_services") || [];
    const duplicateFound = add_on_services.some(
      (service, i) => i !== index && service?.service_name === value
    );

    if (duplicateFound) {
      message.error(
        "This service type is already added. Please select a different one."
      );
      const updatedServices = [...add_on_services];
      if (updatedServices[index]) {
        updatedServices[index].service_name = undefined;
      }
      form.setFieldsValue({ add_on_services: updatedServices });
      return false;
    }
    return true;
  };

  const handleServiceTypeChange = (index, value) => {
    if (!checkDuplicateServiceType(index, value)) return;

    const add_on_services = form.getFieldValue("add_on_services") || [];
    const updatedServices = [...add_on_services];
    updatedServices[index] = { ...updatedServices[index], service_name: value };
    form.setFieldsValue({ add_on_services: updatedServices });
  };

  const getTabItems = () => {
    const add_on_services = form.getFieldValue("add_on_services") || [];
    return add_on_services.map((_, index) => ({
      key: String(index),
      label: `Service ${index + 1}`,
      children: renderServiceForm(index),
      closable: true,
    }));
  };

  const renderServiceForm = (name) => (
    <div className="p-4">
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Service Type"
            name={["add_on_services", name, "service_name"]}
            rules={[{ required: true, message: "Service type is required" }]}
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
            name={["add_on_services", name, "is_percentage"]}
            label="Service Charge Type"
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
            shouldUpdate={(prev, curr) =>
              prev.add_on_services?.[name]?.is_percentage !==
              curr.add_on_services?.[name]?.is_percentage
            }
          >
            {({ getFieldValue }) => {
              const isPercentage = getFieldValue([
                "add_on_services",
                name,
                "is_percentage",
              ]);
              return isPercentage ? (
                <Form.Item
                  name={["add_on_services", name, "percentage_or_amount"]}
                  label="Service Charge Percentage"
                  rules={[
                    { required: true, message: "Please enter percentage" },
                    {
                      type: "number",
                      min: 0,
                      max: 100,
                      message: "Must be between 0 and 100",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter percentage"
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name={["add_on_services", name, "percentage_or_amount"]}
                  label="Service Charge Amount"
                  rules={[
                    { required: true, message: "Please enter amount" },
                    { type: "number", min: 0, message: "Must be >= 0" },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter amount"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Service Description"
        name={["add_on_services", name, "description"]}
        rules={[{ required: true, message: "Description is required" }]}
      >
        <TextArea placeholder="Describe this service" rows={3} />
      </Form.Item>
      <Form.Item label="Service Features">
        <Form.List name={["add_on_services", name, "service_features"]}>
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
            if (currentRow.length > 0) rows.push(currentRow);

            return (
              <div>
                {rows.map((row, rowIndex) => (
                  <Row
                    gutter={8}
                    key={`row-${rowIndex}`}
                    style={{ marginBottom: "8px" }}
                  >
                    {row.map((field) => (
                      <Col key={field.key} xs={24} sm={8}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Form.Item
                            {...field}
                            name={[field.name]}
                            rules={[
                              {
                                required: true,
                                message: "Feature text required",
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
                  rows[rows.length - 1].length === MAX_FIELDS_PER_ROW) && (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => addFeature()}
                    style={{ marginTop: "4px" }}
                  >
                    Add Feature
                  </Button>
                )}
              </div>
            );
          }}
        </Form.List>
      </Form.Item>
    </div>
  );

  return (
    <Card className="border border-gray-200 mb-6" title="Add-On Services">
      <Form form={form} layout="vertical">
        <Form.Item name="add_on_services" initialValue={[{}]} noStyle />
        {hasServices ? (
          <Tabs
            key={tabKey}
            type="editable-card"
            activeKey={activeKey}
            onChange={setActiveKey}
            onEdit={(targetKey, action) => {
              if (action === "add") addTab();
              else if (action === "remove") removeTab(targetKey);
            }}
            items={getTabItems()}
            addIcon={<PlusOutlined />}
          />
        ) : (
          <div className="text-center py-8">
            <Empty description="No add_on_services added" />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addTab}
              style={{ marginTop: "16px" }}
            >
              Add Service
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
};

export default AddOnServicesForm;
