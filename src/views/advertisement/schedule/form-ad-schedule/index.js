import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import AdScheduleFormFields from "../components/AdScheduleFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { createAdSchedule } from "store/slices/advertisementSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import LoadingOverlay from "components/util-components/Loader/index";

const ADD = "ADD";
const EDIT = 'EDIT'

const AdScheduleForm = ({ mode }) => {

  const { loading, error, responseData, responseMessage,createScheduleLoading } = useSelector(
    (state) => state.advertisement
  );
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      console.log("HEREEEEEEEEEEEEEEEEEEEEE");
      
      const values = await form.validateFields();
      let formattedStartDate = Utils.formatDate(values.start_date);
      let formattedEndDate = Utils.formatDate(values.end_date);
      let formattedStartTime = Utils.formatTime(values.start_date)
      let formattedEndTime = Utils.formatTime(values.end_date)
      
      values.start_date = formattedStartDate
      values.start_time = formattedStartTime
      values.end_date = formattedEndDate
      values.end_time = formattedEndTime
      

      if (mode === ADD) {
      console.log("ENTEREDDDDDDDDDDDDDDDD");

        dispatch(setSelectedSubmitItem(values));

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
      <LoadingOverlay 
        loading={createScheduleLoading} 
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={createAdSchedule}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/schedule/list`}
        responseMessage={responseMessage}
      />
    </>
  );
};

export default AdScheduleForm;
