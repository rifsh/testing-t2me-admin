import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, message, message as antdMessage, Upload } from "antd";
import {
  addAdCategory, setAdCategoryModalLoading,
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

  const { loading, error, responseData, responseMessage, dialogVisible, modalLoading, message: warningMessage, selectedAdCategory } = useSelector(
    (state) => state.adCategory
  );


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
      });
    }
  }, [mode, category, form]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form Values:", values); 

      if (mode === ADD) {
        const formData = {
          ...values,


        };
        console.log("Form Data to dispatch:", formData); 

        dispatch(setSelectedSubmitItem(formData));
      } else if (mode === EDIT) {
        const formData = {
          ...values,


        };
        const data = {
          ...values,
          id: category.id,
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
      antdMessage.success(`Category ${selectedAdCategory.name} updated successfully`);
      form.resetFields();
      navigate(`${APP_PREFIX_PATH}/advertisement/category/list`);
    }
  };

  const handleModalCancel = () => {
    dispatch(setAdCategoryDialogVisible(false));
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
              <DiscardButton form={form} />

              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addAdCategory}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/category/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default CategoryFormFields;
