// components/payments/PaymentMethodFields.js

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

/**
 * Renders form fields based on payment type
 */
export const PaymentMethodFields = ({ name, paymentType, form }) => {
  if (!paymentType) return null;

  switch (paymentType) {
    case "upi":
      return (
        <>
          <Form.Item
            name={[name, "upiProvider"]}
            label="UPI Provider"
            rules={[
              { required: true, message: "Please select a UPI provider" },
            ]}
          >
            <Select placeholder="Select UPI provider">
              {UPI_PROVIDERS.map((provider) => (
                <Option key={provider.value} value={provider.value}>
                  {provider.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item
            name={[name, "qrCode"]}
            label="QR Code"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
          </Form.Item> */}
        </>
      );
    case "card":
      return (
        <>
          <Form.Item
            name={[name, "cardType"]}
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
            name={[name, "bankName"]}
            label="Bank Name"
            rules={[{ required: true, message: "Please enter bank name" }]}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
          <Form.Item name={[name, "bankCode"]} label="Bank Code">
            <Input placeholder="Enter bank code (if applicable)" />
          </Form.Item>
        </>
      );
    case "ngenius":
      return (
        <>
          <Form.Item
            name={[name, "merchantId"]}
            label="Merchant ID"
            rules={[{ required: true, message: "Please enter merchant ID" }]}
          >
            <Input placeholder="Enter N-Genius merchant ID" />
          </Form.Item>
          <Form.Item
            name={[name, "apiKey"]}
            label="API Key"
            rules={[{ required: true, message: "Please enter API key" }]}
          >
            <Input.Password placeholder="Enter N-Genius API key" />
          </Form.Item>
          <Form.Item
            name={[name, "outletReference"]}
            label="Outlet Reference"
            rules={[
              { required: true, message: "Please enter outlet reference" },
            ]}
          >
            <Input placeholder="Enter outlet reference" />
          </Form.Item>
        </>
      );
    default:
      return null;
  }
};
