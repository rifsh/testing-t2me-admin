import React from "react";
import { Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { CARD_TYPES, UPI_PROVIDERS } from "constants/PaymentConstants";
import {
  ResolutionByServices,
  SupportImageFormat,
} from "constants/SupportFileConstants";
import Utils from "utils";

const { Option } = Select;

const PaymentMethodFields = ({ name, payment_type, form }) => {
  if (!payment_type) return null;

  const getFieldName = (fieldName) => [
    "payment_methods",
    name,
    "additional_details",
    fieldName,
  ];

  // Render fields based on payment type
  switch (payment_type) {
    case "upi":
      return (
        <div className="payment-method-fields-upi">
          <Form.Item
            name={getFieldName("upiProvider")}
            label="UPI Provider"
            rules={[
              { required: true, message: "Please select a UPI provider" },
            ]}
          >
            <Select placeholder="Select UPI provider" mode="multiple">
              {UPI_PROVIDERS.map((provider) => (
                <Option key={provider.value} value={provider.value}>
                  {provider.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={getFieldName("qrCode")}
            label="QR Code"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "Please upload QR code" }]}
          >
            <Upload
              name="qr_code"
              listType="picture"
              maxCount={1}
              beforeUpload={(file) =>
                Utils.handleBeforeUpload(file, ResolutionByServices.place)
              }
              accept={`.${SupportImageFormat.join(",.")}`}
            >
              <Button icon={<UploadOutlined />}>Upload QR Code</Button>
            </Upload>
          </Form.Item>
        </div>
      );
    case "card":
      return (
        <div className="payment-method-fields-card">
          <Form.Item
            name={getFieldName("cardType")}
            label="Card Type"
            rules={[{ required: true, message: "Please select card type" }]}
          >
            <Select placeholder="Select card type" mode="multiple">
              {CARD_TYPES.map((card) => (
                <Option key={card.value} value={card.value}>
                  {card.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={getFieldName("bankName")}
            label="Bank Name"
            rules={[{ required: true, message: "Please enter bank name" }]}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
          <Form.Item name={getFieldName("bankCode")} label="Bank Code">
            <Input placeholder="Enter bank code (if applicable)" />
          </Form.Item>
        </div>
      );
    case "ngenius": 
      return (
        <div className="payment-method-fields-ngenius">
          <Form.Item
            name={getFieldName("merchant_id")}
            label="Merchant ID"
            rules={[{ required: true, message: "Please enter merchant ID" }]}
          >
            <Input placeholder="Enter N-Genius merchant ID" />
          </Form.Item>
          <Form.Item
            name={getFieldName("api_key")}
            label="API Key"
            rules={[{ required: true, message: "Please enter API key" }]}
          >
            <Input.Password placeholder="Enter N-Genius API key" />
          </Form.Item>
          <Form.Item
            name={getFieldName("outlet_reference")}
            label="Outlet Reference"
            rules={[
              { required: true, message: "Please enter outlet reference" },
            ]}
          >
            <Input placeholder="Enter outlet reference" />
          </Form.Item>
        </div>
      );
    default:
      return null;
  }
};

export default PaymentMethodFields;
