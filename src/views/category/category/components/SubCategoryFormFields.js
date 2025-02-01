import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, message, Select, Upload, Typography } from "antd";
import {
  addSubCategory,
  fetchCategories,
  editSubCategory,
  setCatDialogVisible, setCatModalLoading, setSelectedCatDetails
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Option } from "antd/es/mentions";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { UploadOutlined } from "@ant-design/icons";
import { SupportImageFormat, SupportFormatContent } from "constants/SupportFileConstants";
import Utils from "utils/index";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { ActionType } from "utils/api/warning-submit-util";

const ADD = "ADD";
const EDIT = "EDIT";
const { Text } = Typography;

const rules = {
  category: [{ required: true, message: "Please Select a category" }],
  name: [{ required: true, message: "Please enter sub category name" }],
  description: [{ required: true, message: "Please enter sub category description" }],
};

const SubCategoryFormFields = ({ mode, category }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, error, categories, responseData, responseMessage, dialogVisible, responseImpactData,
    message: warningMessage,
    selectedCat,
    editable_status,
    modalLoading, } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  useEffect(() => {
    console.log("MODEEEEEEEEEE", mode);
    console.log("CATEGORYYYYYYYY", category);

    if (mode === EDIT && category) {
      form.setFieldsValue({
        category_id: category.category.id,
        name: category.name,
        description: category.description,
        thumbnail_image: category.thumbnail_image && category.thumbnail_image !== "images"
          ? [
            {
              uid: "-1",
              name: category.thumbnail_image.split("/").pop(),
              status: "done",
              url: category.thumbnail_image,
            },
          ]
          : [],
      });
    }
  }, [mode, category, form]);

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
  const handleBeforeUpload = Utils.handleBeforeUpload;

  const onFinish = async () => {
    const values = await form.validateFields();

    try {
      if (mode === EDIT) {
        const data = {
          ...values,
          id: category.id
        };
        console.log("Edit Data:", data);

        const resultAction = await dispatch(
          editSubCategory({ data, action: ActionType.WARNING, })
        );

        if (editSubCategory.fulfilled.match(resultAction)) {
          dispatch(setSelectedCatDetails(data));
          dispatch(setCatDialogVisible(true));
        }
      } else {
        const formData = {
          ...values,
        };

        dispatch(setSelectedSubmitItem(formData));
      }

    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }

  };

  const handleModalSubmit = async () => {
    dispatch(setCatModalLoading(true));
    const resultAction = await dispatch(
      editSubCategory({ data: selectedCat, action: ActionType.SUBMIT })
    );
    dispatch(setCatModalLoading(false));
    dispatch(setCatDialogVisible(false));
    if (editSubCategory.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedCat));
    }
  };

  const handleModalCancel = () => {
    dispatch(setCatDialogVisible(false));
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
            <Form.Item name="description" label="Description" rules={rules.description}>
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
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={handleBeforeUpload}
                accept={`.${SupportImageFormat.join(',.')}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>


            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {" "}
              {SupportImageFormat.join(", ")}.
              {" "}
            </Text>
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
      <LoadingOverlay
        loading={loading}
      />
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        responseData={responseImpactData}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules"
        }}
        editable_status={editable_status}
      />

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === EDIT ? editSubCategory : addSubCategory}
        navigationPath={`${APP_PREFIX_PATH}/category/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default SubCategoryFormFields;