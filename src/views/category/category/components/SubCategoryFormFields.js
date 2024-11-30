import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, message, Select } from "antd";
import {
  addCategory,
  addSubCategory,
  fetchCategories,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Option } from "antd/es/mentions";

const ADD = "ADD";
const EDIT = "EDIT";

const rules = {
  category: [{ required: true, message: "Please Select a category" }],
  name: [{ required: true, message: "Please enter sub category name" }],
  description: [{ required: true, message: "Please enter sub category description" }],
};

const CategoryFormFields = ({ mode = ADD }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { loading, error, categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
  
      const resultAction = await dispatch(
        addSubCategory({ data: values, categoryId: values.category_id })
      );
  
      if (addSubCategory.fulfilled.match(resultAction)) {
        message.success(`Subcategory ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/category/list`);
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
            <Form.Item
              name="category_id"
              label="Category name"
              rules={rules.category}
            >
              <Select className="w-100" placeholder="Choose a Category">
                {categories.map((elm) => (
                  <Option key={elm.name} value={elm.id}>
                    {elm.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="name" label="Category" rules={rules.name}>
              <Input placeholder="Category" />
            </Form.Item>
            <Form.Item name="description" label="Description"  rules={rules.description}>
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
              <Button>Discard</Button>
              <Button
                type="primary"
                onClick={onFinish}
                // htmlType="submit"
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
