import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Button,
  message,
  message as antdMessage,
  Upload,
  Space,
  Select,
} from "antd";
import {
  addAdCategory,
  setAdCategoryModalLoading,
  setAdCategoryDialogVisible,
  setSelectedAdCategory,
  updateAdCategory,
} from "store/slices/adCategorySlice";
import { ActionType } from "utils/api/warning-submit-util";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import LoadingOverlay from "components/util-components/Loader/index";
import {
  FileTypeImageOptions,
  FileTypeResolutions,
} from "constants/SupportFileConstants";
import { AdvCategoryCode } from "constants/AppConstants";

const ADD = "ADD";
const EDIT = "EDIT";

// Custom validation functions
const validateFileSize = (rule, value) => {
  return new Promise((resolve, reject) => {
    if (!value) {
      reject(new Error(rule.message));
      return;
    }

    const numValue = parseFloat(value);

    // Check if it's a valid number
    if (isNaN(numValue)) {
      reject(new Error("Please enter a valid number"));
      return;
    }

    // Check if it's positive
    if (numValue <= 0) {
      reject(new Error("File size must be greater than 0"));
      return;
    }

    // Check reasonable limits (e.g., max 1000MB)
    if (numValue > 1000) {
      reject(new Error("File size cannot exceed 1000 MB"));
      return;
    }

    resolve();
  });
};

const validateMinMaxSize = (form) => (rule, value) => {
  return new Promise((resolve, reject) => {
    if (!value) {
      reject(new Error(rule.message));
      return;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      reject(new Error("Please enter a valid number"));
      return;
    }

    if (numValue <= 0) {
      reject(new Error("File size must be greater than 0"));
      return;
    }

    if (numValue > 1000) {
      reject(new Error("File size cannot exceed 1000 MB"));
      return;
    }

    // Cross-field validation
    const minSize = form.getFieldValue('min_size');
    const maxSize = form.getFieldValue('max_size');

    if (rule.field === 'max_size' && minSize && numValue <= parseFloat(minSize)) {
      reject(new Error("Max size must be greater than min size"));
      return;
    }

    if (rule.field === 'min_size' && maxSize && numValue >= parseFloat(maxSize)) {
      reject(new Error("Min size must be less than max size"));
      return;
    }

    resolve();
  });
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
    modalLoading,
    message: warningMessage,
    selectedAdCategory,
    responseImpactData,
    editable_status,
    warningPagination,
  } = useSelector((state) => state.adCategory);

  // Dynamic rules with form context
  const rules = {
    name: [{ required: true, message: "Please enter category name" }],
    description: [
      { required: true, message: "Please enter category description" },
    ],
    category_code: [{ required: true, message: "Please enter category code" }],
    min_size: [
      { required: true, message: "Please enter min size" },
      { validator: validateMinMaxSize(form), field: 'min_size' }
    ],
    max_size: [
      { required: true, message: "Please enter max size" },
      { validator: validateMinMaxSize(form), field: 'max_size' }
    ],
    resolution: [{ required: false, message: "Please enter resolution" }],
    file_type: [{ required: true, message: "Please enter file_type" }],
  };

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (mode === EDIT && category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        category_code: category.category_code,
        min_size: category.min_size,
        max_size: category.max_size,
        resolution: category.resolution,
        file_type: category.file_type ? category.file_type.split(", ") : [],
      });
    }
  }, [mode, category, form]);

  // Handle field changes to trigger cross-validation
  const handleFileSizeChange = (field) => {
    // Re-validate both min and max size when either changes
    setTimeout(() => {
      if (field === 'min_size') {
        form.validateFields(['max_size']);
      } else if (field === 'max_size') {
        form.validateFields(['min_size']);
      }
    }, 100);
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form Values:", values);

      if (mode === ADD) {
        const formData = {
          ...values,
          file_type: values.file_type ? values.file_type.join(", ") : "",
        };
        console.log("Form Data to dispatch:", formData);

        dispatch(setSelectedSubmitItem(formData));
      } else if (mode === EDIT) {
        console.log("ITS AN EDITTTTTTTTTTTTT TAXXXXXXX");

        const data = {
          ...values,
          id: category.id,
          file_type: values.file_type ? values.file_type.join(", ") : "",
        };
        console.log("Edit Data:", data);

        const resultAction = await dispatch(
          updateAdCategory({ data, action: ActionType.WARNING })
        );

        if (updateAdCategory.fulfilled.match(resultAction)) {
          dispatch(setSelectedAdCategory(data));
          dispatch(setAdCategoryDialogVisible(true));
        }
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  const handleModalSubmit = async () => {
    dispatch(setAdCategoryModalLoading(true));
    const resultAction = await dispatch(
      updateAdCategory({ data: selectedAdCategory, action: ActionType.SUBMIT })
    );
    dispatch(setAdCategoryModalLoading(false));
    dispatch(setAdCategoryDialogVisible(false));
    if (updateAdCategory.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedAdCategory));
    }
  };

  const handleModalCancel = () => {
    dispatch(setAdCategoryDialogVisible(false));
  };

  const handleWarningPagination = (page, size) => {
    console.log("------------------------");
    console.log("CHANIGN...........");

    dispatch(
      updateAdCategory({
        data: selectedAdCategory,
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
            <Form.Item
              name="category_code"
              label="Code"
              rules={rules.category_code}
            >
              <Select
                loading={loading}
                mode="single"
                style={{ width: "100%" }}
                placeholder="Please select Code"
                showSearch
              >
                {AdvCategoryCode.map((item) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="name" label="Category Name" rules={rules.name}>
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
              name="min_size"
              label="Min Size (MB)"
              rules={rules.min_size}
            >
              <Input
                placeholder="Min Size"
                type="number"
                min={0}
                step={0.1}
                onChange={() => handleFileSizeChange('min_size')}
              />
            </Form.Item>

            <Form.Item
              name="max_size"
              label="Max Size (MB)"
              rules={rules.max_size}
            >
              <Input
                placeholder="Max Size"
                type="number"
                min={0}
                step={0.1}
                onChange={() => handleFileSizeChange('max_size')}
              />
            </Form.Item>

            <Form.Item name="resolution" label="Resolution (Height X Width)">
              <Select
                loading={loading}
                mode="single"
                style={{ width: "100%" }}
                placeholder="Please select resolution"
                notFoundContent={
                  FileTypeResolutions.length ? null : "No File Types Available"
                }
              >
                {FileTypeResolutions.map((resolution) => (
                  <Select.Option
                    key={resolution.key}
                    value={resolution.resolution}
                  >
                    {resolution.resolution}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="file_type" label="File Type">
              <Select
                loading={loading}
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Please select file type"
                notFoundContent={
                  FileTypeImageOptions.length ? null : "No File Types Available"
                }
              >
                {FileTypeImageOptions.map((fileType) => (
                  <Select.Option key={fileType.value} value={fileType.value}>
                    {fileType.label}
                  </Select.Option>
                ))}
              </Select>
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
        addFunction={mode === "EDIT" ? updateAdCategory : addAdCategory}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/category/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default CategoryFormFields;