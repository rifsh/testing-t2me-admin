import React, { useEffect, useRef } from "react";
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
  fetchEventTypeDetails,
} from "store/slices/eventSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import {
  setSelectedSubmitItem,
  resetStatusModalState,
} from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import LoadingOverlay from "components/util-components/Loader/index";
import { ActionType } from "utils/api/warning-submit-util";

const EventTypeForm = ({ mode, typeId }) => {
  const {
    loading,
    error,
    responseData,
    responseMessage,
    selectedEvent,
    eventTypeDetails,
    submitPagination,
  } = useSelector((state) => state.event);
  const { selectedSubmitItem } = useSelector((state) => state.modalSlice);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const fetchedDetails = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetStatusModalState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (typeId && mode === "EDIT" && !fetchedDetails.current) {
      fetchedDetails.current = true;
      dispatch(fetchEventTypeDetails(typeId));
    }
  }, [dispatch, typeId, mode]);

  useEffect(() => {
    if (eventTypeDetails && mode === "EDIT") {
      // const formData = {
      //   name: eventTypeDetails.name,

      //   display_name: eventTypeDetails.display_name,
      //   description: eventTypeDetails.description,
      // };
      form.setFieldsValue(eventTypeDetails);
    }
  }, [form, eventTypeDetails, mode]);

  const onFinish = async () => {
    try {
      if (selectedSubmitItem) {
        return;
      }

      const values = await form.validateFields();

      if (mode === "EDIT") {
        const editData = {
          ...values,
          id: eventTypeDetails?.id || 0,
        };

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
                  loading={loading}
                  disabled={!!selectedSubmitItem}
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
    </>
  );
};

export default EventTypeForm;
