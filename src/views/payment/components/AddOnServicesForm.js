import React from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Switch,
  Upload,
  Select,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddOnServicesForm = ({ form }) => {
  const serviceTypes = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
  ];

  return (
    <Card className="border border-gray-200 mb-6" title={" Add-On Services"}>
      <Form form={form} layout="vertical">
        <Form.List name="services">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  className="mb-6 border border-gray-200"
                  title={
                    <Form.Item
                      {...restField}
                      name={[name, "serviceName"]}
                      className="m-0"
                      rules={[
                        {
                          required: true,
                          message: "Service name is required",
                        },
                      ]}
                    >
                      <Input placeholder="Service name" />
                    </Form.Item>
                  }
                  extra={
                    <Space>
                      <Button
                        type="text"
                        className="text-red-500"
                        onClick={() => remove(name)}
                        icon={<MinusCircleOutlined />}
                      />
                    </Space>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Form.Item
                      {...restField}
                      label="Service Type"
                      name={[name, "serviceType"]}
                      rules={[
                        {
                          required: true,
                          message: "Service type is required",
                        },
                      ]}
                    >
                      <Select placeholder="Select service type">
                        {serviceTypes.map((type) => (
                          <Option key={type.value} value={type.value}>
                            {type.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <div className="flex gap-2">
                      <Form.Item
                        {...restField}
                        label="Price"
                        name={[name, "price"]}
                        className="flex-grow"
                        rules={[
                          { required: true, message: "Price is required" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="0.00"
                          precision={2}
                          min={0}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item
                    {...restField}
                    label="Service Description"
                    name={[name, "description"]}
                    rules={[
                      { required: true, message: "Description is required" },
                    ]}
                  >
                    <TextArea
                      placeholder="Describe what this service offers"
                      rows={3}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Service Logo"
                    name={[name, "logo"]}
                  >
                    <Upload
                      name="logo"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item {...restField} label="Service Features">
                    <Form.List name={[name, "features"]}>
                      {(
                        featureFields,
                        { add: addFeature, remove: removeFeature }
                      ) => (
                        <>
                          {featureFields.map(
                            ({
                              key: featureKey,
                              name: featureName,
                              ...restFeatureField
                            }) => (
                              <Space
                                key={featureKey}
                                className="flex w-full mb-2"
                                align="baseline"
                              >
                                <Form.Item
                                  {...restFeatureField}
                                  name={[featureName, "text"]}
                                  className="w-full m-0"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Feature text is required",
                                    },
                                  ]}
                                >
                                  <Input placeholder="Feature description" />
                                </Form.Item>
                                <Button
                                  type="text"
                                  className="flex items-center justify-center text-red-500"
                                  onClick={() => removeFeature(featureName)}
                                  icon={<MinusCircleOutlined />}
                                />
                              </Space>
                            )
                          )}
                          <Form.Item className="m-0 mt-2">
                            <Button
                              type="dashed"
                              onClick={() => addFeature()}
                              block
                              className="flex items-center justify-center"
                              icon={<PlusOutlined />}
                            >
                              Add Feature
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </Form.Item>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  className="flex items-center justify-center"
                  icon={<PlusOutlined />}
                >
                  Add Service
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );
};

export default AddOnServicesForm;
