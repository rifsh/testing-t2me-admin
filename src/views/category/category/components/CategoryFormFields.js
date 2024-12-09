import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, message } from "antd";
import { addCategory, updateCategory } from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const ADD = "ADD";
const EDIT = "EDIT";

const rules = {
  name: [{ required: true, message: "Please enter category name" }],
  description: [
    { required: true, message: "Please enter category description" },
  ],
};

const CategoryFormFields = ({ mode = ADD, category }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.category);

  // Handle error message
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Populate form fields if editing
  useEffect(() => {
    if (mode === EDIT && category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        
      });
    }
  }, [mode, category, form]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (mode === ADD) {
        const resultAction = await dispatch(addCategory(values));
        if (addCategory.fulfilled.match(resultAction)) {
          message.success(`Category ${values.name} added successfully`);
          form.resetFields();
          navigate(`${APP_PREFIX_PATH}/category/list`);
        }
      } else if (mode === EDIT) {
        const resultAction = await dispatch(updateCategory({ id: category.id, ...values }));
        if (updateCategory.fulfilled.match(resultAction)) {
          message.success(`Category ${values.name} updated successfully`);
          navigate(`${APP_PREFIX_PATH}/category/list`);
        }
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Category" rules={rules.name}>
              <Input placeholder="Category" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={rules.description}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter category description"
              />
            </Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <Button onClick={() => navigate(`${APP_PREFIX_PATH}/category/list`)}>
                Discard
              </Button>
              <Button
                type="primary"
                onClick={onFinish}
                loading={loading}
              >
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default CategoryFormFields;
