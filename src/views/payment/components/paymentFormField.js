import React from "react";
import {
  Form,
  Card,
  Button,
  Input,
  Upload,
  Space,
  Checkbox,
  message,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getVenues } from "store/slices/locationSlice";
import { addPayment } from "store/slices/paymentSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import {
  SupportImageFormat,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import { useDispatch } from "react-redux";
import Utils from "utils/index";

const PaymentFormFields = ({ mode, id }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    console.log("Form values:", values);

    try {
      const transformedData = {
        place_id: values.place_id,
        event_id: values.Event ? parseInt(values.Event) : undefined,
        terms_and_conditions: values.url,
        additional_urls: values.additional_urls,

        payment_qr_details:
          values.qrPayments?.map((qr) => ({
            provider_name: qr.paymentProvider,
            qr_code: qr.qrCode?.[0]?.originFileObj,
          })) || [],

        payment_methods:
          values.cardPayments?.map((payment) => ({
            bank_name: payment.bankName,
            card_types: payment.cardType,
          })) || [],

        add_on_services:
          values.services?.map((service) => ({
            name: service.name,
            image: service.image?.[0]?.originFileObj,
          })) || [],
      };

      console.log("Transformed data:", transformedData);

      const result = await dispatch(addPayment(transformedData)).unwrap();

      if (result) {
        message.success("Payment details added successfully");
        form.resetFields();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to add payment details");
    }
  };
  const handleFinishFailed = (errorInfo) => {
    console.log("Form submission failed:", errorInfo);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onFinishFailed={handleFinishFailed}
    >
      <Card title="Payment Form">
        <PlaceWithCountryForm
          form={form}
          label="Place"
          onSelect={(id) => {
            dispatch(getVenues({ place_id: id }));
            form.setFieldsValue({ venue_id: null });
          }}
          rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
        />
        <Form.Item name="Event" label="Event (Optional)">
          <Input placeholder="Select Your Event" type="text" />
        </Form.Item>

        <Form.Item
          name="url"
          label="Terms and Conditions"
          rules={[
            {
              required: true,
              message: "Please enter terms and conditions URL",
            },
          ]}
        >
          <Input placeholder="Enter your URL" type="text" />
        </Form.Item>

        <Form.Item name="additional_urls" label="Additional Urls">
          <Input placeholder="Enter your URL" type="text" />
        </Form.Item>
      </Card>

      <Card>
        <Form.Item
          name="services"
          label="Add-On Services"
          rules={[
            {
              validator: (_, value) =>
                value && value.length > 0
                  ? Promise.resolve()
                  : Promise.reject("Please add at least one service"),
            },
          ]}
        >
          <Form.List name="services">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[
                        {
                          required: true,
                          message: "Please enter service name",
                        },
                      ]}
                    >
                      <Input placeholder="Service name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "image"]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please upload service image",
                        },
                      ]}
                    >
                      <Upload
                        name="thumbnail_image"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={(file) =>
                          Utils.handleBeforeUpload(
                            file,
                            ResolutionByServices.place
                          )
                        }
                        accept={`.${SupportImageFormat.join(",.")}`}
                      >
                        <Button icon={<UploadOutlined />}>
                          Click to upload
                        </Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Service
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      <Card>
        <Form.Item name="qrPayments" label="QR Payments">
          <Form.List name="qrPayments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "paymentProvider"]}
                      rules={[
                        { required: true, message: "Enter provider name" },
                      ]}
                    >
                      <Input placeholder="Payment Provider" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "qrCode"]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      rules={[
                        { required: true, message: "Please upload QR code" },
                      ]}
                    >
                      <Upload
                        name="qr_code"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={(file) =>
                          Utils.handleBeforeUpload(
                            file,
                            ResolutionByServices.place
                          )
                        }
                        accept={`.${SupportImageFormat.join(",.")}`}
                      >
                        <Button icon={<UploadOutlined />}>
                          Upload QR Code
                        </Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add QR Payment
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      <Card>
        <Form.Item
          name="cardPayments"
          label="Add Payment Methods"
          rules={[
            {
              validator: (_, value) =>
                value && value.length > 0
                  ? Promise.resolve()
                  : Promise.reject("Please add at least one payment method"),
            },
          ]}
        >
          <Form.List name="cardPayments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "bankName"]}
                      rules={[{ required: true, message: "Enter bank name" }]}
                    >
                      <Input placeholder="Bank Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "cardType"]}
                      rules={[{ required: true, message: "Select card type" }]}
                    >
                      <Checkbox.Group>
                        <Checkbox value="debit">Debit Card</Checkbox>
                        <Checkbox value="credit">Credit Card</Checkbox>
                      </Checkbox.Group>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Bank & Card Type
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Card>

      <Card>
        <div className="container" style={{ padding: "0px" }}>
          <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
            <DiscardButton form={form} />
            <div className="mb-3">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Flex>
        </div>
      </Card>
    </Form>
  );
};

export default PaymentFormFields;