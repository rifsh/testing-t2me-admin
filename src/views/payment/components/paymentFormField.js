import React from "react";
import { Form, Card, Button, Input, Upload, Space, message } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getVenues } from "store/slices/locationSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { useDispatch } from "react-redux";

const PaymentFormFields = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
      }
      return isImage && isLt2M;
    },
  };

  return (
    <Form form={form} layout="vertical">
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

        {/* <Card title="Add-on Services" className="mt-4"> */}
        <Form.Item
          name="Add-On Services"
          label="Add-On Services"
          rules={[{ required: true }]}
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
                    >
                      <Upload {...uploadProps} listType="picture-card">
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
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
        {/* </Card> */}

        <Form.Item name="url" label="Terms and Conditions" form={form}>
          <Input placeholder="Enter your url" type="text" />
        </Form.Item>
        <div className="container" style={{ padding: "0px" }}>
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
          >
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
