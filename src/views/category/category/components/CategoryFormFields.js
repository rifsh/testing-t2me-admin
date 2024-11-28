import React, { useState } from "react";
import { Input, Row, Col, Card, Form, Button, message } from "antd";
import { addCategory } from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const rules = {
  name: [
    {
      required: true,
      message: "Please enter category name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter category description",
    },
  ],
};

const ADD = 'ADD';
const EDIT = 'EDIT';
const CategoryFormFields = (props) => {
  const { mode = ADD, param } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (mode === ADD) {
        await dispatch(addCategory(values)).unwrap(); // Use `unwrap` to handle the resolved value
        message.success(`Category ${values.name} added successfully.`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/category/list`);
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Category" rules={rules.name}>
              <Input placeholder="Category" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={rules.description}
            >
              <Input.TextArea rows={4} placeholder="Enter category description" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Button htmlType="reset">Discard</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
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