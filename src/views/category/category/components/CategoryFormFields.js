import React, { useEffect, useState } from "react";
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
import {
  setSelectedSubmitItem,
  setOriginalFiles,
} from "store/slices/modalSlice";
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
import BackButton from "components/Buttons/BackPageButoon";
import DraftSystem from "drafts/components/DraftSystem";
import { extractFileObjects, UPLOAD_FIELD_CONFIGS } from "utils/s3UploadUtil";

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
  const [isUploading, setIsUploading] = useState(false);

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

  const EXTRA_FIELDS_FROM_RESPONSE = ["thumbnail_image_upload_url"];

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
      // Map thumbnail image with proper structure
      const thumbnailFile =
        category.thumbnail_image && category.thumbnail_image !== "images"
          ? [
              {
                uid: "thumbnail-1",
                name: category.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${category.thumbnail_image}`,
                id: null,
                type: "image",
                mediaType: "image",
              },
            ]
          : [];

      form.setFieldsValue({
        name: category.name,
        description: category.description,
        thumbnail_image: thumbnailFile,
      });
    }
  }, [mode, category, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
        .filter(
          (file) =>
            file &&
            typeof file === "object" &&
            file !== null &&
            (file.originFileObj || file.name || file.uid)
        )
        .map((file) => ({
          uid: file.uid,
          name: file.name,
          status: file.status || "done",
          url: file.url,
          thumbUrl: file.thumbUrl || file.url,
          originFileObj: file.originFileObj,
          id: file.id,
          type: file.type || "image",
          mediaType: file.mediaType || "image",
          ...(file.response && { response: file.response }),
          ...(file.percent && { percent: file.percent }),
        }));
    }

    const fileList = e?.fileList || [];
    return fileList
      .filter(
        (file) =>
          file &&
          typeof file === "object" &&
          file !== null &&
          (file.originFileObj || file.name || file.uid)
      )
      .map((file) => ({
        uid: file.uid,
        name: file.name,
        status: file.status || "done",
        url: file.url,
        thumbUrl: file.thumbUrl || file.url,
        originFileObj: file.originFileObj,
        id: file.id,
        type: file.type || "image",
        mediaType: file.mediaType || "image",
        ...(file.response && { response: file.response }),
        ...(file.percent && { percent: file.percent }),
      }));
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      // Extract original file objects for later S3 upload
      const originalFiles = extractFileObjects(values);

      // Store original files in Redux for use in confirmation
      dispatch(setOriginalFiles(originalFiles));

      // Transform thumbnail_image - always image type
      const thumbnailData = values.thumbnail_image?.[0]
        ? {
            file_name:
              values.thumbnail_image[0].name ||
              values.thumbnail_image[0].file_name ||
              null,
            media_type: "image",
          }
        : null;

      if (mode === ADD) {
        const formData = {
          ...values,
          thumbnail_image: thumbnailData,
        };
        console.log(formData);

        dispatch(setSelectedSubmitItem(formData));
      } else if (mode === EDIT) {
        const data = {
          ...values,
          thumbnail_image: thumbnailData,
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
                form={form}
                allowVideo={false}
              />
            </Form.Item>
            <Text
              type="warning"
              style={{
                padding: "0px 0px",
                fontSize: "11px",
                display: "block",
                marginTop: "8px",
              }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.category || ResolutionByServices.place}{" "}
              pixels.
            </Text>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <DraftSystem
                form={form}
                formType="catgry"
                mode={mode}
                titleField="name"
                excludeFromDraft={["id", "created_at"]}
                style={{ marginRight: 12, display: "inline-block" }}
                enableAutoSave={mode !== "EDIT"}
              />

              <DiscardButton form={form} />

              <Button
                type="primary"
                onClick={onFinish}
                loading={loading || isUploading}
              >
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
      <LoadingOverlay loading={loading || isUploading} />
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
        mode={mode}
        form={form}
        formType={"catgry"}
        setIsUploading={setIsUploading}
        extraFieldsFromResponse={EXTRA_FIELDS_FROM_RESPONSE}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.CATEGORY}
      />
    </Row>
  );
};

export default CategoryFormFields;
