import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Upload, Button, Typography } from "antd";
import moment from "moment";
import { UploadOutlined } from "@ant-design/icons";
import { SupportImageFormat, SupportFormatContent } from "constants/SupportFileConstants";
import Utils from "utils/index";

const { Text } = Typography;

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter country description",
    },
  ],
  price: [
    {
      required: true,
      message: "Please enter country price",
    },
  ],
  comparePrice: [],
  taxRate: [
    {
      required: true,
      message: "Please enter tax rate",
    },
  ],
  cost: [
    {
      required: true,
      message: "Please enter item cost",
    },
  ],
  startDate: [
    {
      required: true,
      message: "Please select the start date",
    }
  ],
  endDate: [
    {
      required: true,
      message: "Please select the end date",
    }
  ]
};

function CouponFormFields(props) {
  const [form] = Form.useForm();
  const startDate = Form.useWatch('start_date', form);

  const disablePastDates = (current) => {
    return current && current < moment().startOf('day');
  };

  const disableEndDate = (current) => {
    if (!startDate) {
      return false;
    }
    return current && current < moment(startDate).startOf('day');
  };

  const handleStartDateChange = () => {
    form.setFieldValue('end_date', null);
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const handleBeforeUpload = Utils.handleBeforeUpload;

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Coupon Details">
          <Form.Item
            name="name"
            label="Coupon Name"
            rules={rules.name}
          >
            <Input placeholder="Enter Coupon Name" />
          </Form.Item>
          <Form.Item
            name="coupon_code"
            label="Coupon Code"
            rules={[
              {
                required: true,
                message: "Please enter coupon code",
              }
            ]}
          >
            <Input placeholder="Enter Coupon Code" />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage"
            rules={[
              {
                required: true,
                message: "Please enter discount percentage",
              },
              {
                type: 'number',
                transform: (value) => Number(value),
                min: 0,
                max: 100,
                message: "Discount must be between 0 and 100",
              }
            ]}
          >
            <Input placeholder="Enter discount percentage" type="number" onWheel={(e) => e.target.blur()} />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
            rules={rules.startDate}
          >
            <DatePicker
              className="w-100"
              placeholder="Select start date"
              format="YYYY-MM-DD"
              disabledDate={disablePastDates}
              onChange={handleStartDateChange}
              showToday={false}
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Date"
            rules={[
              ...rules.endDate,
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('start_date');
                  if (!startDate || !value) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(startDate, 'day')) {
                    return Promise.reject(new Error('End date must be after start date'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              className="w-100"
              placeholder="Select end date"
              format="YYYY-MM-DD"
              disabledDate={disableEndDate}
              showToday={false}
            />
          </Form.Item>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.thumbnail_image}
          >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={handleBeforeUpload}
              accept={`.${SupportImageFormat.join(',.')}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
            
          </Form.Item>
          <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {" "}
              {SupportImageFormat.join(", ")}.
              {" "}
            </Text>
          <Form.Item
            name="max_uses"
            label="Max Users"
            rules={[
              {
                required: true,
                message: "Please enter maximum users",
              },
              {
                type: 'number',
                transform: (value) => Number(value),
                min: 1,
                message: "Maximum users must be at least 1",
              }
            ]}
          >
            <Input type="number" placeholder="Enter maximum users" onWheel={(e) => e.target.blur()} />
          </Form.Item>

          <Form.Item
            name="min_purchase_amount"
            label="Min Purchase Amount"
            rules={[
              {
                required: true,
                message: "Please enter minimum purchase amount",
              },
              {
                type: 'number',
                transform: (value) => Number(value),
                min: 0,
                message: "Minimum purchase amount cannot be negative",
              }
            ]}
          >
            <Input type="number" placeholder="Enter min purchase amount" onWheel={(e) => e.target.blur()} />
          </Form.Item>

        </Card>
      </Col>
    </Row>
  );
}

export default CouponFormFields;