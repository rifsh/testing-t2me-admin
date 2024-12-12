import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";

import ProductListData from "assets/data/product-list.data.json";
import SeatFormFields from "../components/ScheduleFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import AddSchedule from "../add-schedule";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { addSchedule } from "store/slices/scheduleSlice";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const ADD = "ADD";
const EDIT = "EDIT";

const ScheduleForm = (props) => {
  const { mode = ADD } = props;
  const { loading, error, selectedOffers, selectedCoupons } = useSelector(
    (state) => state.schedules
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
      const values = form.getFieldValue();

      const startDate = moment(values.start_date).format("YYYY-MM-DD");
      const endDate = moment(values.end_date).format("YYYY-MM-DD");
      const startTime = moment(values.start_date).format("HH:mm:ss");
      const endTime = moment(values.end_date).format("HH:mm:ss");

      const submitData = {
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        event_id: values.event,
        offer_ids:
          selectedOffers.map((e) => ({
            offer_id: e.id,
            valid_from: moment(e.start_date).format("YYYY-MM-DD"),
            valid_to: moment(e.end_date).format("YYYY-MM-DD"),
          })) ?? [],
        coupon_ids:
          selectedCoupons.map((e) => ({
            coupon_id: e.id,
            valid_from: moment(e.start_date).format("YYYY-MM-DD"),
            valid_to: moment(e.end_date).format("YYYY-MM-DD"),
          })) ?? [],
      };

      const resultAction = await dispatch(addSchedule(submitData));
      if (AddSchedule.fulfilled.match(resultAction)) {
        message.success(`Schedule ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/schedule/list`);
      } else {
        message.error("Failed to add the Schedule. Please try again.");
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
                <Button className="mr-2">Discard</Button>
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
        <div className="container" style={{ marginTop: 30 }}>
          <SeatFormFields />
        </div>
      </Form>
    </>
  );
};

export default ScheduleForm;
