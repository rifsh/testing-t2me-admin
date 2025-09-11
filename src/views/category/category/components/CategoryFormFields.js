import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Button,
  message,
  Upload,
  Typography,
} from "antd";
import {
  addCategory,
  updateCategory,  
  editCategory,
  setCatDialogVisible,
  setCatModalLoading,
  setSelectedCatDetails,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { UploadOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { ActionType } from "utils/api/warning-submit-util";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";

const { Text } = Typography;
const ADD = "ADD";
const EDIT = "EDIT";

const rules = {
  name: [{ required: true, message: "Please enter category name" }],
  description: [
    { required: true, message: "Please enter category description" },
  ],
};

const CategoryFormFields = ({ mode, category }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    error,
    responseData,
    responseMessage,
    dialogVisible,
    responseImpactData,
    message: warningMessage,
    selectedCat,
    editable_status,
    warningPagination,
    modalLoading,
  } = useSelector((state) => state.category);

  // Handle error message
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Populate form fields if editing
  useEffect(() => {
    console.log("MODEEEEEEEEEE", mode);
    console.log("CATEGORYYYYYYYY", category);

    if (mode === EDIT && category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        thumbnail_image:
          category.thumbnail_image && category.thumbnail_image !== "images"
            ? [
                {
                  uid: "-1",
                  name: category.thumbnail_image.split("/").pop(),
                  status: "done",
                  url: `${CDN_PATH}/${category.thumbnail_image}`,
                },
              ]
            : [],
      });
    }
  }, [mode, category, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };
  const handleBeforeUpload = Utils.handleBeforeUpload;

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (mode === ADD) {
        const formData = {
          ...values,
        };
        console.log(formData);
        
        dispatch(setSelectedSubmitItem(formData));

        // const resultAction = await dispatch(addCategory(values));
        // if (addCategory.fulfilled.match(resultAction)) {
        //   message.success(`Category ${values.name} added successfully`);
        //   form.resetFields();
        //   navigate(`${APP_PREFIX_PATH}/category/list`);
        // }
      } else if (mode === EDIT) {
        const data = {
          ...values,
          id: category.id,
        };
        console.log("Edit Data:", data);

        const resultAction = await dispatch(
          editCategory({ data, action: ActionType.WARNING })
        );

        if (editCategory.fulfilled.match(resultAction)) {
          dispatch(setSelectedCatDetails(data));
          dispatch(setCatDialogVisible(true));
        }
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };
  const handleModalSubmit = async () => {
    dispatch(setCatModalLoading(true));
    const resultAction = await dispatch(
      editCategory({ data: selectedCat, action: ActionType.SUBMIT })
    );
    dispatch(setCatModalLoading(false));
    dispatch(setCatDialogVisible(false));
    if (editCategory.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedCat));
    }
  };

  const handleModalCancel = () => {
    dispatch(setCatDialogVisible(false));
  };
  const handleWarningPagination = (page, size) => {
    console.log("------------------------");

    console.log("CHANIGN...........");

    dispatch(
      editCategory({
        data: selectedCat,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
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
            <Form.Item
              name="thumbnail_image"
              label="Thumbnail Image"
              valuePropName="value"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <ResizedImgePicker
                maxCount={1}
                targetResolution={ThumbnailImageResolutions.CATEGORY}
              />
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.place} pixels.{" "}
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

              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
      <LoadingOverlay loading={loading} />
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
        loading={loading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === EDIT ? editCategory : addCategory}
        navigationPath={`${APP_PREFIX_PATH}/category/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default CategoryFormFields;
