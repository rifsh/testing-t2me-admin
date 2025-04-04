import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import EventTypeFormFields from "../components/EventTypeFormFields";
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  updateEventType,
  addEventType,
  setDialogVisible,
  setModalLoading,
} from "store/slices/eventSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import LoadingOverlay from "components/util-components/Loader/index";
import { ActionType } from "utils/api/warning-submit-util";

const EventTypeForm = ({ mode, type }) => {
  const {
    loading,
    error,
    responseData,
    responseMessage,
    selectedEvent,
    submitPagination,
  } = useSelector((state) => state.event);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (type && mode === "EDIT") {
      const formData = {
        name: type.name,
        display_name: type.display_name,
        description: type.description,
      };
      form.setFieldsValue(formData);
    }
  }, [form, type, mode]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "EDIT") {
        const editData = {
          ...values,
          id: type?.id || 0,
        };
        console.log(editData);

        dispatch(setSelectedSubmitItem(editData));
      } else {
        const formData = {
          ...values,
        };

        dispatch(setSelectedSubmitItem(formData));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="advanced_search"
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
                {mode === "ADD" ? "Add New Type" : "Edit Type"}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={onFinish}
                  // htmlType="submit"
                  loading={loading}
                >
                  {mode === "ADD" ? "Add" : "Save"}
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
                children: <EventTypeFormFields form={form} mode={mode} />,
              },
            ]}
          />
        </div>
        <SubmitAndConfirmModal
          responseData={responseData}
          addFunction={mode === "EDIT" ? updateEventType : addEventType}
          navigationPath={`${APP_PREFIX_PATH}/event/type/list`}
          responseMessage={responseMessage}
          pagination={submitPagination}
        />
      </Form>
      {/* <LoadingOverlay loading={loading} /> */}
    </>
  );
};

export default EventTypeForm;
