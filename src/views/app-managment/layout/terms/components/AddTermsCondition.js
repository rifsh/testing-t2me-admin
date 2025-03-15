import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TermsCondition, PostTermsCondition } from "store/slices/authSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Title } = Typography;
const { TextArea } = Input;

const AddTermsCondition = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { termsConditionData, termsLoading } = useSelector((state) => state.auth);

  // Local state to handle first-time load
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(TermsCondition())
      .unwrap()
      .finally(() => setLoading(false)); // Ensure loading stops after fetching data
  }, [dispatch]);

  // Update form values when data loads
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
            last_updated: "",
            introduction: "",
            sections: [{ title: "", content: "" }],
            contact: "",
          }}
        >
          {/* <Form.Item label="Last Updated" name="last_updated">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item> */}

          <Form.Item
            label="Introduction"
            name="introduction"
            rules={[{ required: true, message: "Introduction is required" }]}
          >
            <TextArea rows={3} placeholder="Enter introduction" />
          </Form.Item>

          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
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

                    <Button danger onClick={() => remove(name)}>Remove Section</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} style={{ marginBottom: 16 }}>
                  Add Section
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item label="Contact Email" name="contact">
            <Input placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item>
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
