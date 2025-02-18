import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import AdScheduleFormFields from "../components/AdScheduleFormFields";
import {
  setDraggedFile,
  setDraggedFileState,
  setSelectedDroppedFile,
} from "store/slices/advertisementSlice";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  createAdSchedule,
  editAdSchedule,
} from "store/slices/advertisementSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { ActionType } from "utils/api/warning-submit-util";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import LoadingOverlay from "components/util-components/Loader/index";

const ADD = "ADD";
const EDIT = "EDIT";

const AdScheduleForm = ({ mode, scheduleDetails, id }) => {
  const {
    loading,
    error,
    responseData,
    message,
    responseMessage,
    createScheduleLoading,
    filteredAdBanner,
    draggedFile,
    selectedDroppedFile,
    isVideoPlaying,
  } = useSelector((state) => state.advertisement);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    console.log("SETTING DATA");
    console.log(scheduleDetails, "THIS IS SCHEDULE DATA");

    if (scheduleDetails && mode === "EDIT") {
      const startTime = dayjs(scheduleDetails.start_time, "HH:mm");
      const endTime = dayjs(scheduleDetails.end_time, "HH:mm");

      const formData = {
        name: scheduleDetails.name,
        advertisement_banner_id: scheduleDetails?.advertisement_banner.id,
        start_date: dayjs(scheduleDetails.start_date),
        end_date: dayjs(scheduleDetails.end_date),
        start_time: startTime,
        end_time: endTime,
        duration: scheduleDetails.duration,
      };

      if (scheduleDetails.advertisement_banner) {
        console.log("BANNER ADDED TO FILE");
        dispatch(setSelectedDroppedFile(scheduleDetails.advertisement_banner));
      }

      form.setFieldsValue(formData);
    }
  }, [form, scheduleDetails, mode, dispatch]);
  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "EDIT") {
        let formattedStartDate = Utils.formatDate(values.start_date);
        let formattedEndDate = Utils.formatDate(values.end_date);
        let formattedStartTime = Utils.formatTime(values.start_time);
        let formattedEndTime = Utils.formatTime(values.end_time);

        values.start_date = formattedStartDate;
        values.start_time = formattedStartTime;
        values.end_date = formattedEndDate;
        values.end_time = formattedEndTime;

        const editData = {
          ...values,
          id: id,
        };
        console.log("Edit Data:", editData);
        const resultAction = await dispatch(
          editAdSchedule({ data: editData, action: ActionType.SUBMIT })
        );

        if (editAdSchedule.fulfilled.match(resultAction)) {
          dispatch(setSelectedSubmitItem(editData));
        }
      } else {
        console.log("HEREEEEEEEEEEEEEEEEEEEEE");

        let formattedStartDate = Utils.formatDate(values.start_date);
        let formattedEndDate = Utils.formatDate(values.end_date);
        let formattedStartTime = Utils.formatTime(values.start_time);
        let formattedEndTime = Utils.formatTime(values.end_time);

        values.start_date = formattedStartDate;
        values.start_time = formattedStartTime;
        values.end_date = formattedEndDate;
        values.end_time = formattedEndTime;

        console.log(values, "THIS IS THE VALUES");

        if (mode === ADD) {
          console.log("ENTEREDDDDDDDDDDDDDDDD");

          dispatch(setSelectedSubmitItem(values));
        }
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
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
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
                {mode === "ADD" ? "Add New Schedule" : `Edit Schedule`}{" "}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={createScheduleLoading}
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
                children: <AdScheduleFormFields form={form} />,
              },
            ]}
          />
        </div>
      </Form>
      <LoadingOverlay loading={createScheduleLoading} />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editAdSchedule : createAdSchedule}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/schedule/list`}
        responseMessage={mode === "EDIT" ? message : responseMessage}
      />
    </>
  );
};

export default AdScheduleForm;
