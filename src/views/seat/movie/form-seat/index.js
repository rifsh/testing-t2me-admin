import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";

import DiscardButton from "components/shared-components/Buttons/DiscardButton";

import { useSelector, useDispatch } from "react-redux";
import TheaterLayout from "../components/TheaterLayout";
import MovieSeatDetailForm from "../components/MovieSeatDetailForm";
import { SEAT_STRUCTURE_TYPES } from "constants/SeatTypes";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import {
  addSeatStructure,
  editSeatStructure,
} from "store/slices/movieSeatSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";

const ADD = "ADD";
const EDIT = "EDIT";

const SeatForm = (props) => {
  const { mode = ADD, param } = props;
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");

  const {
    responseData,
    responseMessage,
    submitPagination,
    seats,
    seatTypes,
    selectedSeatStructure,
  } = useSelector((state) => state.movieSeatSlice);

  useEffect(() => {
    if (selectedSeatStructure && mode === EDIT) {
      const formData = {
        name: selectedSeatStructure.name,
        venue_id: selectedSeatStructure.venue_id,
      };

      form.setFieldsValue(formData);
    }
  }, [form, selectedSeatStructure, mode]);

  const onFinish = async () => {
    if (activeTabKey === "1") {
      setActiveTabKey("2");
    } else {
      try {
        const formValues = await form.validateFields();
        setSubmitLoading(true);

        if (mode === EDIT) {
          const editData = {
            ...formValues,
            id: selectedSeatStructure.id,
            seat_data: {
              seats,
              seatTypes,
            },
          };

          const resultAction = await dispatch(
            editSeatStructure({ data: editData, action: ActionType.WARNING })
          );

          if (editSeatStructure.fulfilled.match(resultAction)) {
            dispatch(setSelectedSubmitItem(editData));
          }
        } else {
          let totalVisibleSeats = 0;
          seats.forEach((row) => {
            row.forEach((seat) => {
              if (seat.isVisible) {
                totalVisibleSeats++;
              }
            });
          });

          const combinedData = {
            ...formValues,
            total_row: seats.length,
            total_column: seats[0]?.length || 0,
            total_seats: totalVisibleSeats,
            type: SEAT_STRUCTURE_TYPES.MOVIE,
            seat_data: {
              seats,
              seatTypes,
            },
          };

          console.log("Combined form and state data:", combinedData);
          dispatch(setSelectedSubmitItem(combinedData));
        }
      } catch (info) {
        console.error("Validation Failed:", info);
        message.error("Please enter all required fields.");
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  return (
    <>
      <Form layout="vertical" form={form}>
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2
                className="mb-3"
                style={{ fontSize: "20px", fontWeight: "bold" }}
              >
                {mode === ADD ? "Add Seat Structure" : `Edit Seat Structure`}{" "}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={submitLoading}
                >
                  {activeTabKey === "1" ? "Next" : "Submit"}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            style={{ marginTop: 30 }}
            items={[
              {
                label: "Screen Selection",
                key: "1",
                children: <MovieSeatDetailForm form={form} />,
              },
              {
                label: "Seat Layout",
                key: "2",
                children: <TheaterLayout />,
              },
            ]}
          />
        </div>
      </Form>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === EDIT ? editSeatStructure : addSeatStructure}
        navigationPath={`${APP_PREFIX_PATH}/seat/movie/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />
    </>
  );
};

export default SeatForm;
