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
import PaymentMethodFields from "./PaymentMethodFields";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPaymentMethod } from "store/slices/paymentSlice";

const { Option } = Select;

const PaymentMethodTabs = ({ form }) => {
  const [activeKey, setActiveKey] = useState("0");
  // Force re-render when payment type changes
  const [, forceUpdate] = useState({});

  const dispatch = useDispatch();
  const {
    methods: paymentMethods,
    loading,
    error,
  } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchAllPaymentMethod());
  }, [dispatch]);
  console.log(paymentMethods);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    // Initialize with one empty payment method if none exists
    const payment_methods = form.getFieldValue("payment_methods");
    if (!payment_methods || payment_methods.length === 0) {
      form.setFieldsValue({ payment_methods: [{}] });
    }
  }, [form]);

  const onChange = (key) => {
    setActiveKey(key);
  };

  const addTab = () => {
    const payment_methods = form.getFieldValue("payment_methods") || [];
    const newPaymentMethod = {};
    const newPaymentMethods = [...payment_methods, newPaymentMethod];
    form.setFieldsValue({ payment_methods: newPaymentMethods });
    setActiveKey(String(payment_methods.length));
  };

  const removeTab = (targetKey) => {
    const payment_methods = form.getFieldValue("payment_methods") || [];

    if (payment_methods.length <= 1) {
      message.warning("At least one payment method is required");
      return;
    }

    const targetIndex = Number(targetKey);

    const newPaymentMethods = payment_methods.filter(
      (_, index) => index !== targetIndex
    );

    form.setFieldsValue({ payment_methods: newPaymentMethods });
    if (activeKey === targetKey) {
      const newActiveKey = targetIndex === 0 ? "0" : String(targetIndex - 1);
      setActiveKey(newActiveKey);
    } else if (Number(activeKey) > targetIndex) {
      setActiveKey(String(Number(activeKey) - 1));
    }
    forceUpdate({});
  };

  const checkDuplicatePaymentType = (index, value) => {
    const payment_methods = form.getFieldValue("payment_methods") || [];

    const duplicateFound = payment_methods.some(
      (method, i) => i !== index && method && method.payment_type === value
    );

    if (duplicateFound) {
      message.error(
        "This payment method is already added. Please select a different one."
      );

      const updatedPaymentMethods = [...payment_methods];
      if (updatedPaymentMethods[index]) {
        updatedPaymentMethods[index] = {
          ...updatedPaymentMethods[index],
          payment_type: undefined,
        };
      }

      setTimeout(() => {
        form.setFieldsValue({
          payment_methods: updatedPaymentMethods,
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

    const payment_methods = form.getFieldValue("payment_methods") || [];
    const currentValues = payment_methods[index] || {};

    const newValues = {
      ...currentValues,
      payment_type: value,
    };

    const updatedPaymentMethods = [...payment_methods];
    updatedPaymentMethods[index] = newValues;

    form.setFieldsValue({
      payment_methods: updatedPaymentMethods,
    });

    forceUpdate({});
  };

  const renderPaymentMethodForm = (index) => {
    const payment_methods = form.getFieldValue("payment_methods") || [];
    const paymentMethod = payment_methods[index] || {};
    const payment_type = paymentMethod.payment_type;

    return (
      <div className="p-4">
        <Form.Item
          name={["payment_methods", index, "payment_type"]}
          label="Payment Type"
          rules={[
            {
              required: true,
              message: "Please select payment type",
            },
          ]}
        >
          <Select
            placeholder={
              loading ? "Loading payment methods..." : "Select payment type"
            }
            onChange={(value) => handlePaymentTypeChange(index, value)}
            loading={loading}
            disabled={loading || error}
          >
            {error ? (
              <Option disabled value="error">
                Failed to load payment methods
              </Option>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <Option key={method.id} value={method.id}>
                  {method.name}
                </Option>
              ))
            ) : (
              <Option disabled value="no-data">
                No payment methods available
              </Option>
            )}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name={["payment_methods", index, "is_percentage"]}
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
                  prevValues.payment_methods?.[index]?.is_percentage !==
                  currentValues.payment_methods?.[index]?.is_percentage
                );
              }}
            >
              {({ getFieldValue }) => {
                const isPercentage = getFieldValue([
                  "payment_methods",
                  index,
                  "is_percentage",
                ]);

                if (isPercentage === true) {
                  return (
                    <Form.Item
                      name={["payment_methods", index, "payment_charge"]}
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
                    name={["payment_methods", index, "payment_charge"]}
                    label="Service Charge Amount"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Service Charge amount",
                      },
                      {
                        validator: async (_, value) => {
                          if (
                            value === null ||
                            value === undefined ||
                            value === ""
                          ) {
                            return Promise.reject(
                              new Error("Please enter Service Charge amount")
                            );
                          }

                          // Convert to number and check if it's a valid positive number
                          const numValue = Number(value);
                          if (isNaN(numValue) || numValue < 0) {
                            return Promise.reject(
                              new Error(
                                "Service Charge must be a non-negative number"
                              )
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter Service Charge amount"
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name={["payment_methods", index, "authorized_url"]}
              label="Authorized URL"
            >
              <Input placeholder="Enter authorized URL" />
            </Form.Item>
          </Col>
        </Row>

        {payment_type && (
          <PaymentMethodFields
            name={index}
            payment_type={payment_type}
            form={form}
          />
        )}
      </div>
    );
  };

  const getTabItems = () => {
    const payment_methods = form.getFieldValue("payment_methods") || [];
    return payment_methods.map((_, index) => ({
      key: String(index),
      label: `Payment Method ${index + 1}`,
      children: renderPaymentMethodForm(index),
      closeIcon: payment_methods.length > 1 && (
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
      <Form.Item name="payment_methods" initialValue={[{}]} noStyle />

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
