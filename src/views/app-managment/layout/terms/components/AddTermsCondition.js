import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TermsCondition, PostTermsCondition } from "store/slices/authSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AddTermsCondition = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { termsConditionData, termsLoading } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(TermsCondition())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (termsConditionData) {
      form.setFieldsValue({
        introduction: termsConditionData.introduction || "",
        sections: termsConditionData.sections || [{ title: "", content: "" }],
        contact: termsConditionData.contact || "",
      });
    }
  }, [termsConditionData, form]);

  const onFinish = (values) => {
    dispatch(PostTermsCondition(values))
      .unwrap()
      .then(() => {
        navigate(`${APP_PREFIX_PATH}/app/management/layout/terms/list`);
      })
      .catch((error) => {
        console.error("Error submitting terms:", error);
      });
  };

  return (
    <Card>
      <Title level={3}>{termsConditionData ? "Update" : "Add"} Terms and Conditions</Title>

      {!loading && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            introduction: "",
            sections: [{ title: "", content: "" }],
            contact: "",
          }}
        >
          {/* Introduction Field */}
          <Card style={{ marginBottom: 20 }}>
            <Text strong>Introduction:</Text>
            <Form.Item
              name="introduction"
              rules={[{ required: true, message: "Introduction is required" }]}
              style={{ marginTop: 10 }}
            >
              <TextArea rows={3} placeholder="Enter introduction" />
            </Form.Item>
          </Card>

          {/* Sections */}
          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: "100%" }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`Section ${name + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
                    }
                    style={{ background: "#fafafa" }}
                  >
                    <Form.Item
                      {...restField}
                      label="Section Title"
                      name={[name, "title"]}
                      rules={[{ required: true, message: "Title is required" }]}
                    >
                      <Input placeholder="Enter section title" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Content"
                      name={[name, "content"]}
                      rules={[{ required: true, message: "Content is required" }]}
                    >
                      <TextArea rows={2} placeholder="Enter section content" />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add Section
                </Button>
              </Space>
            )}
          </Form.List>

          {/* Contact Email Field */}
          <Card style={{ marginTop: 20 }}>
            <Text strong>Contact Email:</Text>
            <Form.Item name="contact" style={{ marginTop: 10 }}>
              <Input placeholder="Enter contact email" />
            </Form.Item>
          </Card>

          {/* Submit Button */}
          <Form.Item style={{ marginTop: 20 }}>
            <Button type="primary" htmlType="submit" loading={termsLoading}>
              {termsConditionData ? "Update" : "Add"} Terms and Conditions
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default AddTermsCondition;
