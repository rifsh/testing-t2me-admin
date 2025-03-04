import React, { useState, useEffect } from "react";
import {
  Form,
  Card,
  Button,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  message,
  Radio,
  InputNumber,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { PAYMENT_METHODS } from "constants/PaymentConstants";
import PaymentMethodFields from "./PaymentMethodFields";

const { Option } = Select;

const PaymentMethodTabs = ({ form }) => {
  const [activeKey, setActiveKey] = useState("0");
  // Force re-render when payment type changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Initialize with one empty payment method if none exists
    const paymentMethods = form.getFieldValue("paymentMethods");
    if (!paymentMethods || paymentMethods.length === 0) {
      form.setFieldsValue({ paymentMethods: [{}] });
    }
  }, [form]);

  const onChange = (key) => {
    setActiveKey(key);
  };

  const addTab = () => {
    const paymentMethods = form.getFieldValue("paymentMethods") || [];
    const newPaymentMethod = {};
    const newPaymentMethods = [...paymentMethods, newPaymentMethod];
    form.setFieldsValue({ paymentMethods: newPaymentMethods });
    setActiveKey(String(paymentMethods.length));
  };

  const removeTab = (targetKey) => {
    const paymentMethods = form.getFieldValue("paymentMethods") || [];

    if (paymentMethods.length <= 1) {
      message.warning("At least one payment method is required");
      return;
    }

    const targetIndex = Number(targetKey);

    // Remove the selected payment method
    const newPaymentMethods = paymentMethods.filter(
      (_, index) => index !== targetIndex
    );

    // Update form values with filtered array
    form.setFieldsValue({ paymentMethods: newPaymentMethods });

    // Adjust active tab if the removed tab was the active one
    if (activeKey === targetKey) {
      const newActiveKey = targetIndex === 0 ? "0" : String(targetIndex - 1);
      setActiveKey(newActiveKey);
    } else if (Number(activeKey) > targetIndex) {
      // If active tab is after the removed tab, decrement active key
      setActiveKey(String(Number(activeKey) - 1));
    }

    // Force form to re-render immediately
    forceUpdate({});
  };

  const checkDuplicatePaymentType = (index, value) => {
    const paymentMethods = form.getFieldValue("paymentMethods") || [];

    const duplicateFound = paymentMethods.some(
      (method, i) => i !== index && method && method.paymentType === value
    );

    if (duplicateFound) {
      message.error(
        "This payment method is already added. Please select a different one."
      );

      // Create a copy of all current payment methods
      const updatedPaymentMethods = [...paymentMethods];

      // Only remove the paymentType field from the current item, preserving other fields
      if (updatedPaymentMethods[index]) {
        updatedPaymentMethods[index] = {
          ...updatedPaymentMethods[index],
          paymentType: undefined, // Set to undefined instead of deleting
        };
      }

      // Force select element to clear its value visually
      setTimeout(() => {
        form.setFieldsValue({
          paymentMethods: updatedPaymentMethods,
        });
      }, 0);

      return false;
    }

    return true;
  };

  const handlePaymentTypeChange = (index, value) => {
    if (!checkDuplicatePaymentType(index, value)) {
      return;
    }

    // When payment type changes, preserve only basic fields
    const paymentMethods = form.getFieldValue("paymentMethods") || [];
    const currentValues = paymentMethods[index] || {};

    const newValues = {
      ...currentValues,
      paymentType: value,
    };

    // Update just this specific payment method
    const updatedPaymentMethods = [...paymentMethods];
    updatedPaymentMethods[index] = newValues;

    form.setFieldsValue({
      paymentMethods: updatedPaymentMethods,
    });

    // Force re-render to immediately show the fields
    forceUpdate({});
  };

  const renderPaymentMethodForm = (index) => {
    // Get the current payment type value for this field
    const paymentMethods = form.getFieldValue("paymentMethods") || [];
    const paymentMethod = paymentMethods[index] || {};
    const paymentType = paymentMethod.paymentType;

    return (
      <div className="p-4">
        <Form.Item
          name={["paymentMethods", index, "paymentType"]}
          label="Payment Type"
          rules={[
            {
              required: true,
              message: "Please select payment type",
            },
          ]}
        >
          <Select
            placeholder="Select payment type"
            onChange={(value) => handlePaymentTypeChange(index, value)}
          >
            {PAYMENT_METHODS.map((method) => (
              <Option key={method.value} value={method.value}>
                {method.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name={["paymentMethods", index, "is_percentage"]}
              label="Service charge Type"
              initialValue={false}
            >
              <Radio.Group>
                <Radio value={true}>Percentage</Radio>
                <Radio value={false}>Amount</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                return (
                  prevValues.paymentMethods?.[index]?.is_percentage !==
                  currentValues.paymentMethods?.[index]?.is_percentage
                );
              }}
            >
              {({ getFieldValue }) => {
                const isPercentage = getFieldValue([
                  "paymentMethods",
                  index,
                  "is_percentage",
                ]);

                if (isPercentage === true) {
                  return (
                    <Form.Item
                      name={["paymentMethods", index, "percentage_or_amount"]}
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
                    name={["paymentMethods", index, "payment_charge"]}
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
          <Col span={10}>
            <Form.Item
              name={["paymentMethods", index, "authorizedUrl"]}
              label="Authorized URL"
            >
              <Input placeholder="Enter authorized URL" />
            </Form.Item>
          </Col>
        </Row>

        {paymentType && (
          <PaymentMethodFields
            name={index}
            paymentType={paymentType}
            form={form}
          />
        )}
      </div>
    );
  };

  const getTabItems = () => {
    const paymentMethods = form.getFieldValue("paymentMethods") || [];
    return paymentMethods.map((_, index) => ({
      key: String(index),
      label: `Payment Method ${index + 1}`,
      children: renderPaymentMethodForm(index),
      closeIcon: paymentMethods.length > 1 && (
        <MinusCircleOutlined
          onClick={(e) => {
            e.stopPropagation();
            removeTab(String(index));
          }}
        />
      ),
    }));
  };

  return (
    <Card title="Payment Methods">
      <Form.Item name="paymentMethods" initialValue={[{}]} noStyle />

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
    </Card>
  );
};

export default PaymentMethodTabs;
