import React from "react";
import { Card, Form, Upload, Button, Input, Typography, message } from "antd";
import {
  UploadOutlined,

} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { uploadImageToCdnFooter } from "store/slices/footerSlice";

const { Title, Text } = Typography;

const PaymentLogoForm = ({ form }) => {  // Accept form as prop
  const dispatch = useDispatch();
  const { uploadingImages } = useSelector((state) => state.footer);

  // Handle app logo upload
  const handleAppLogoUpload = async (file) => {
    try {
      message.loading({ content: "Uploading app logo...", key: "app_logo" });

      const result = await dispatch(
        uploadImageToCdnFooter({ file: file, moduleName: "footer" })
      ).unwrap();

      if (result.public_url) {
        form.setFieldsValue({ app_logo_url: result.public_url });
        
        message.success({
          content: "App logo uploaded successfully!",
          key: "app_logo",
        });
      }
      return false; // Prevent auto upload
    } catch (error) {
      console.error("Upload error:", error);
      message.error({ content: `Upload failed: ${error}`, key: "app_logo" });
      return Upload.LIST_IGNORE;
    }
  };

  // Handle payment logo upload
  const handlePaymentLogoUpload = async (file, index) => {
    try {
      const uploadKey = `payment_logo_${index}`;
      message.loading({
        content: "Uploading payment logo...",
        key: uploadKey,
      });

      const result = await dispatch(
        uploadImageToCdnFooter({ file: file, moduleName: "footer" })
      ).unwrap();

      if (result.public_url) {
        const paymentLogos = form.getFieldValue('payment_logos') || [];
        paymentLogos[index] = {
          ...paymentLogos[index],
          method_logo_url: result.public_url  // Store as separate field
        };
        form.setFieldsValue({ payment_logos: paymentLogos });
        
        message.success({
          content: "Payment logo uploaded successfully!",
          key: uploadKey,
        });
      }
      return false;
    } catch (error) {
      console.error("Upload error:", error);
      message.error({
        content: `Upload failed: ${error}`,
        key: `payment_logo_${index}`,
      });
      return Upload.LIST_IGNORE;
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Main App Logo Section */}
        <div>
          <Title level={4}>Main App Logo</Title>
          
          {/* Hidden field to store the URL */}
          <Form.Item name="app_logo_url" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="app_logo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
            rules={[{ required: true, message: "Logo is required" }]}
          >
            <Upload
              name="app_logo"
              listType="picture"
              maxCount={1}
              beforeUpload={(file) => {
                handleAppLogoUpload(file);
                return false; // Prevent auto upload
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploadingImages}>
                Upload App Logo
              </Button>
            </Upload>
          </Form.Item>
          
          {/* Show uploaded URL */}
          <Form.Item noStyle shouldUpdate>
            {() => {
              const url = form.getFieldValue('app_logo_url');
              return url ? (
                <Text type="success" style={{ fontSize: "11px" }}>
                  Image uploaded: {url}
                </Text>
              ) : null;
            }}
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
                    <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
                      
                      {/* Hidden field for storing URL */}
                      <Form.Item
                        {...restField}
                        name={[name, "method_logo_url"]}
                        fieldKey={[fieldKey, "method_logo_url"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "method_logo"]}
                        fieldKey={[fieldKey, "method_logo"]}
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                          if (Array.isArray(e)) return e;
                          return e?.fileList;
                        }}
                        rules={[{ required: true, message: "Upload required" }]}
                      >
                        <Upload
                          name="method_logo"
                          listType="picture"
                          maxCount={1}
                          beforeUpload={(file) => {
                            handlePaymentLogoUpload(file, index);
                            return false; // Prevent auto upload
                          }}
                        >
                          <Button icon={<UploadOutlined />} loading={uploadingImages}>
                            Upload Logo
                          </Button>
                        </Upload>
                      </Form.Item>

                      {/* Show uploaded URL */}
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const logos = form.getFieldValue('payment_logos') || [];
                          const url = logos[index]?.method_logo_url;
                          return url ? (
                            <Text type="success" style={{ fontSize: "11px" }}>
                              Uploaded: {url}
                            </Text>
                          ) : null;
                        }}
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "method_name"]}
                        fieldKey={[fieldKey, "method_name"]}
                        rules={[
                          { required: true, message: "Enter payment name" },
                        ]}
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
