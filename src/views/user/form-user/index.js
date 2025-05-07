import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import UserFormFields from "../components/UserFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { createUser, updateUser } from "store/slices/userSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
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

const ADD = "ADD";

const UserForm = ({ mode, user }) => {
  // const { mode = ADD } = props;
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

  useEffect(() => {
    if (user && mode === "EDIT") {
      const formData = {
        username: user.username,
        position_id: user.role.position_id,
        thumbnail_image:
          user.thumbnail_image && user.thumbnail_image !== "images"
            ? [
              {
                uid: "-1",
                name: user.thumbnail_image.split("/").pop(),
                status: "done",
                url: user.thumbnail_image,
              },
            ]
            : [],
      };
      if (user.role.position_id === UserRoleConstants.eventOrganizerRoleId) {
        dispatch(fetchAllEvent({}));
        dispatch(fetchDropdownTheaters({}));
      }

      if (
        user.role.position_id === UserRoleConstants.eventOrganizerRoleId ||
        user.role.position_id === UserRoleConstants.eventSupportingTeamRoleId
      ) {
        formData.event_ids = user.events
          ? user.events.map((event) => event.id)
          : [];
        formData.theatre_ids = user.theatres
          ? user.theatres.map((theater) => theater.id)
          : [];
      }
      dispatch(setSelectedRole(user.role.position_id));

      form.setFieldsValue(formData);
    }
  }, [form, user, mode]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    const values = await form.validateFields();
    try {
      if (mode === "EDIT") {
        console.log("ITS AN EDITTTTTTTTTTTTT TAXXXXXXX");
        const data = {
          ...values,
          id: user.id,
        };
        console.log("Edit Data:", data);

        const resultAction = await dispatch(
          validateMultipleEvent(values.event_ids)
        );

        if (validateMultipleEvent.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setEventValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const resultAction = await dispatch(
              updateUser({ data, action: ActionType.WARNING })
            );

            if (updateUser.fulfilled.match(resultAction)) {
              dispatch(setSelectedUser(data));
              dispatch(setUserDialogVisible(true));
            }
          }
        }
      } else {
        // dispatch(setSelectedSubmitItem(values));
        const formData = {
          ...values,
        };

        if (
          values.position_id === UserRoleConstants.eventOrganizerRoleId ||
          values.position_id === UserRoleConstants.eventSupportingTeamRoleId
        ) {
          console.log(values.event_ids, "EVENT IDS");
          console.log(formData, "THEATER IDSssss");

          const resultAction = await dispatch(
            validateMultipleEvent(values.event_ids)
          );

          // if (validateMultipleEvent.fulfilled.match(resultAction)) {
          //   const response = resultAction.payload;
          //   if (response.message === "warning") {
          //     dispatch(setEventValidationDialogVisible(true));
          //   } else if (response.data && response.data[0]?.validation_status) {
          //   }
          // }
          dispatch(setSelectedSubmitItem(formData));
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
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2 className="mb-3">
                {mode === "ADD" ? "Add New User" : `Edit User`}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={loading}
                >
                  {mode === "ADD" ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "General",
                key: "1",
                children: <UserFormFields mode={mode} user={user} />,
              },
            ]}
          />
        </div>
      </Form>
      <LoadingOverlay loading={loading} />
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
      />
    </>
  );
};

export default UserForm;
