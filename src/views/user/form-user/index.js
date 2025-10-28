import React, { useEffect, useState } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message, Card } from "antd";
import Flex from "components/shared-components/Flex";
import UserFormFields from "../components/UserFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { createUser, updateUser } from "store/slices/userSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import {
  setSelectedSubmitItem,
  setOriginalFiles,
} from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import LoadingOverlay from "components/util-components/Loader/index";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  fetchAllRoles,
  setSelectedRole,
  setSelectedUser,
  setUserDialogVisible,
  setUserModalLoading,
} from "store/slices/userSlice";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import {
  setEventValidationDialogVisible,
  validateMultipleEvent,
} from "store/slices/eventSlice";
import { getCurrentUser } from "configs/UserAccessConfig";
import { fetchAllEvent } from "store/slices/eventSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { fetchDropdownTheaters } from "store/slices/theaterSlice";
import { extractFileObjects, UPLOAD_FIELD_CONFIGS } from "utils/s3UploadUtil";

const ADD = "ADD";

const UserForm = ({ mode = ADD, user = {} }) => {
  const {
    loading,
    error,
    responseData,
    responseMessage,
    selectedUser,
    dialogVisible,
    responseImpactData,
    message: warningMessage,
    modalLoading,
    editable_status,
  } = useSelector((state) => state.users);

  const { eventValidationDialogVisible, ValidateData, messages } = useSelector(
    (state) => state.event
  );

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const EXTRA_FIELDS_FROM_RESPONSE = ["thumbnail_image_upload_url"];

  useEffect(() => {
    if (user && mode === "EDIT") {
      // Map thumbnail image with proper structure
      const thumbnailFile =
        user.user?.thumbnail_image && user.user?.thumbnail_image !== "images"
          ? [
              {
                uid: "thumbnail-1",
                name: user.user?.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${user.user?.thumbnail_image}`,
                id: null, // User thumbnail doesn't have id
                type: "image",
                mediaType: "image",
              },
            ]
          : [];

      const formData = {
        username: user.user?.username ?? "",
        position_id: user.user?.role?.position_id ?? "",
        thumbnail_image: thumbnailFile,
        event_ids: Array.isArray(user.events)
          ? user.events.map((event) => event.id)
          : [],
        theatre_ids: Array.isArray(user.theatres)
          ? user.theatres.map((theater) => theater.id)
          : [],
      };

      dispatch(setSelectedRole(user.user?.role?.position_id));
      console.warn("Formdata", formData);
      form.setFieldsValue(formData);
    }
  }, [form, user, mode, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

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

      if (mode === "EDIT") {
        const data = {
          ...values,
          id: user.id,
          thumbnail_image: thumbnailData,
        };

        const resultAction = await dispatch(
          validateMultipleEvent(values.event_ids ?? [])
        );

        if (validateMultipleEvent.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setEventValidationDialogVisible(true));
          } else if (response.data && response.data?.[0]?.validation_status) {
            const updateResult = await dispatch(
              updateUser({ data, action: ActionType.WARNING })
            );
            if (updateUser.fulfilled.match(updateResult)) {
              dispatch(setSelectedUser(data));
              dispatch(setUserDialogVisible(true));
            }
          }
        }
      } else {
        const formData = { ...values, thumbnail_image: thumbnailData };

        if (
          values.position_id === UserRoleConstants.eventOrganizerRoleId ||
          values.position_id === UserRoleConstants.eventSupportingTeamRoleId
        ) {
          const resultAction = await dispatch(
            validateMultipleEvent(values.event_ids ?? [])
          );

          if (validateMultipleEvent.fulfilled.match(resultAction)) {
            const response = resultAction.payload;
            if (response.message === "warning") {
              dispatch(setEventValidationDialogVisible(true));
            } else if (response.data && response.data?.[0]?.validation_status) {
              dispatch(setSelectedSubmitItem(formData));
            }
          }
        } else {
          dispatch(setSelectedSubmitItem(formData));
        }
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  const handleModalSubmit = async () => {
    dispatch(setUserModalLoading(true));
    const resultAction = await dispatch(
      updateUser({ data: selectedUser, action: ActionType.SUBMIT })
    );
    dispatch(setUserModalLoading(false));
    dispatch(setUserDialogVisible(false));
    if (updateUser.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedUser));
    }
  };

  const handleModalCancel = () => {
    dispatch(setUserDialogVisible(false));
  };

  const handleValidationModalCancel = () => {
    dispatch(setEventValidationDialogVisible(false));
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="user_form"
        className="ant-advanced-search-form"
      >
        <Card>
          <Flex
            mobileFlex={false}
            justifyContent="space-between"
            alignItems="center"
          >
            <h2 className="font-semibold">
              {mode === "ADD" ? "Add New User" : `Edit User`}
            </h2>
            <div>
              <DiscardButton form={form} />
              <Button
                type="primary"
                onClick={() => onFinish()}
                htmlType="submit"
                loading={loading || isUploading}
              >
                {mode === "ADD" ? "Add" : `Save`}
              </Button>
            </div>
          </Flex>
        </Card>
        <UserFormFields mode={mode} user={user} form={form} />
      </Form>

      <LoadingOverlay loading={loading || isUploading} />

      <ValidationModal
        visible={eventValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={messages}
        onClose={handleValidationModalCancel}
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
          dataKey: "items",
        }}
        editable_status={editable_status}
      />

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? updateUser : createUser}
        navigationPath={`${APP_PREFIX_PATH}/user/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"user"}
        setIsUploading={setIsUploading}
        extraFieldsFromResponse={EXTRA_FIELDS_FROM_RESPONSE}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.USER}
      />
    </>
  );
};

export default UserForm;
