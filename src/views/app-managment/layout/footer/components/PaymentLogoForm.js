import React from "react";
import { Card, Form, Upload, Button, Input, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title } = Typography;

const PaymentLogoForm = () => {
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    if (e && e.fileList) {
      return e.fileList;
    }

    return [];
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Main App Logo Section */}
        <div>
          <Title level={4}>Main App Logo</Title>
          <Form.Item
            name="app_logo"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Logo is required" }]}
          >
            <Upload
              name="app_logo"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Upload App Logo</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* Payment Methods Section */}
        <div>
          <Title level={4}>Payment Methods</Title>
          <Form.List name="payment_logos">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    title={`Payment Method ${index + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      <Button type="link" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    }
                  >
                    <div style={{ display: "flex", gap: 16 }}>
                      <Form.Item
                        {...restField}
                        name={[name, "method_logo"]}
                        fieldKey={[fieldKey, "method_logo"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Upload required" }]}
                        style={{ flex: 2 }}
                      >
                        <Upload
                          name="method_logo"
                          listType="picture"
                          maxCount={1}
                          beforeUpload={() => false}
                        >
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "method_name"]}
                        fieldKey={[fieldKey, "method_name"]}
                        rules={[
                          { required: true, message: "Enter payment name" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Payment Name" />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ marginTop: 16 }}
                >
                  Add Payment Method
                </Button>
              </>
            )}
          </Form.List>
        </div>
      </div>
    </Card>
  );
};

export default PaymentLogoForm;
