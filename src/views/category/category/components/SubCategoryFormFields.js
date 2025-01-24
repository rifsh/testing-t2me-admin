import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, message, Select,Upload, Typography } from "antd";
import {
  addSubCategory,
  fetchCategories,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Option } from "antd/es/mentions";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { UploadOutlined } from "@ant-design/icons";
import { SupportImageFormat, SupportFormatContent } from "constants/SupportFileConstants";

const ADD = "ADD";
// const EDIT = "EDIT";
const { Text } = Typography;

const rules = {
  category: [{ required: true, message: "Please Select a category" }],
  name: [{ required: true, message: "Please enter sub category name" }],
  description: [{ required: true, message: "Please enter sub category description" }],
};

const SubCategoryFormFields = ({ mode = ADD }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { loading, error, categories , responseData, responseMessage } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };


  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
                      ...values,            
                    };
                
        dispatch(setSelectedSubmitItem(formData));
  //  dispatch(setSelectedSubmitItem(values));
      // const resultAction = await dispatch(
      //   addSubCategory({ data: values, categoryId: values.category_id })
      // );
  
      // if (addSubCategory.fulfilled.match(resultAction)) {
      //   message.success(`Subcategory ${values.name} added successfully`);
      //   form.resetFields();
      //   navigate(`${APP_PREFIX_PATH}/category/list`);
      // }
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
            <Form.Item name="name" label="Sub Category" rules={rules.name}>
              <Input placeholder="Sub Category" />
            </Form.Item>
            <Form.Item name="description" label="Description"  rules={rules.description}>
              <Input.TextArea
                rows={4}
               
                placeholder="Enter category description"
              />
            </Form.Item>
            <Form.Item
              name="thumbnail_image"
              label="Thumbnail Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={rules.thumbnail_image}
            >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
              <Text
                type="warning"
                style={{ padding: "00px 00px", fontSize: "11px" }}
              >
                {SupportFormatContent.join(",")}: {" "}
                {SupportImageFormat.join(", ")}.
                {" "}
              </Text>

          </Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
               <DiscardButton form={form} />
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
       <SubmitAndConfirmModal
              responseData={responseData}
              addFunction={addSubCategory}
              navigationPath={`${APP_PREFIX_PATH}/category/list`}
              responseMessage={responseMessage}
            />
    </Row>
  );
};

export default SubCategoryFormFields;