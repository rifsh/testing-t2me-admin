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

    // Don't remove if there's only one payment method
    if (paymentMethods.length <= 1) {
      message.warning("At least one payment method is required");
      return;
    }

    const newPaymentMethods = paymentMethods.filter(
      (_, index) => index !== Number(targetKey)
    );

    form.setFieldsValue({ paymentMethods: newPaymentMethods });

    if (activeKey === targetKey) {
      const newActiveKey =
        targetKey === "0" ? "0" : String(Number(targetKey) - 1);
      setActiveKey(newActiveKey >= 0 ? newActiveKey : "0");
    }
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
          <Col span={12}>
            <Form.Item
              name={["paymentMethods", index, "paymentCharge"]}
              label="Payment Charge (%)"
            >
              <Input
                placeholder="Enter payment charge"
                type="number"
                min={0}
                step={0.01}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
