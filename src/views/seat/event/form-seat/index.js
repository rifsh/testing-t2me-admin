import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";

import DiscardButton from "components/shared-components/Buttons/DiscardButton";

import { useSelector, useDispatch } from "react-redux";
import TheaterLayout from "../../components/TheaterLayout";
import MovieSeatDetailForm from "../components/MovieSeatDetailForm";
import { SEAT_STRUCTURE_TYPES } from "constants/SeatTypes";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import LoadingOverlay from "components/util-components/Loader/index";
import {
  loadSeatData,
  updateSeats,
  setSeatDialogVisible,
  setSeatModalLoading,
  setSelectedSeatStructure,
  resetState,
  addEventSeatStructure,
  editEventSeatStructure,
  getEventSeatStructureDetails,
} from "store/slices/movieSeatSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";
import { fetchScreenData } from "store/slices/screenSlice";
import { nestedToFlat } from "utils/seatUtils";

const ADD = "ADD";
const EDIT = "EDIT";

const SeatForm = (props) => {
  const { mode = ADD, seatId } = props;
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");

  const {
    loading,
    error,
    responseData,
    responseMessage,
    submitPagination,
    seats,
    singleSeatStructure,
    usedSeatTypes,

    selectedSeatStructure,
    responseImpactData,
    warningPagination,
    message: warningMessage,
    modalLoading,
    seatDialogVisible,
    editable_status,
  } = useSelector((state) => state.movieSeatSlice);

  useEffect(() => {
    if (seatId && mode === EDIT) {
      dispatch(getEventSeatStructureDetails({ seat_id: seatId }));
    } else {
      dispatch(resetState());
    }
  }, [seatId, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (singleSeatStructure && mode === EDIT) {
      dispatch(
        getVenues({
          place_id: singleSeatStructure.venue.place.id,
          is_indoor: true,
        })
      );
      dispatch(setSelectedVenue(singleSeatStructure.venue));
      const values = {
        name: singleSeatStructure.name,
        venue_id: singleSeatStructure.venue.id,
        place_id: singleSeatStructure.venue.place.id,

        place: `${singleSeatStructure.venue.place.name}, ${singleSeatStructure.venue.place.country.name}`,
      };
      form.setFieldsValue(values);
      if (
        singleSeatStructure.seat_data &&
        singleSeatStructure.seat_data.seats
      ) {
        dispatch(updateSeats(singleSeatStructure.seat_data.seats));

        if (singleSeatStructure.seat_data.seatTypes) {
          dispatch(
            loadSeatData({
              seats: singleSeatStructure.seat_data.seats,
              seatTypes: singleSeatStructure.seat_data.seatTypes,
            })
          );
        }
      }
    }
  }, [form, singleSeatStructure, mode, dispatch]);

  const onFinish = async () => {
    if (activeTabKey === "1") {
      setActiveTabKey("2");
      return;
    }

    try {
      const formValues = await form.validateFields();
      setSubmitLoading(true);

      if (mode === EDIT) {
        let totalVisibleSeats = 0;
        seats.forEach((row) => {
          row.forEach((seat) => {
            if (seat.isVisible) {
              totalVisibleSeats++;
            }
          });
        });

        const editData = {
          ...formValues,
          id: singleSeatStructure.id,
          total_row: seats.length,
          total_column: seats[0]?.length || 0,
          total_seats: totalVisibleSeats,
          seat_data: {
            seats: nestedToFlat(seats),
            seatTypes: usedSeatTypes,
          },
        };

        const resultAction = await dispatch(
          editEventSeatStructure({ data: editData, action: ActionType.WARNING })
        );

        if (editEventSeatStructure.fulfilled.match(resultAction)) {
          dispatch(setSelectedSeatStructure(editData));
          console.log("asdfjflaf");

          dispatch(setSeatDialogVisible(true));
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
            seats: nestedToFlat(seats),
            seatTypes: usedSeatTypes,
          },
        };

        dispatch(setSelectedSubmitItem(combinedData));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      editEventSeatStructure({
        data: selectedSeatStructure,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setSeatModalLoading(true));
    const resultAction = await dispatch(
      editEventSeatStructure({
        data: selectedSeatStructure,
        action: ActionType.SUBMIT,
      })
    );
    dispatch(setSeatModalLoading(false));
    dispatch(setSeatDialogVisible(false));
    if (editEventSeatStructure.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedSeatStructure));
    }
  };

  const handleModalCancel = () => {
    dispatch(setSeatDialogVisible(false));
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
                  loading={submitLoading || loading}
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
                children: <MovieSeatDetailForm form={form} mode={mode} />,
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
      <LoadingOverlay loading={loading} />
      <WarningModal
        visible={seatDialogVisible}
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
          title: "Affected Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={
          mode === EDIT ? editEventSeatStructure : addEventSeatStructure
        }
        navigationPath={`${APP_PREFIX_PATH}/seat/event/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />
    </>
  );
};

export default SeatForm;
