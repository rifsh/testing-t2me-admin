import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Form, Button, message, Card, Steps, Divider } from "antd";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { useSelector, useDispatch } from "react-redux";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import LoadingOverlay from "components/util-components/Loader/index";
import {
  addSeatStructure,
  editSeatStructure,
  getMovieSeatStructureDetails,
  loadSeatData,
  updateSeats,
  setSeatDialogVisible,
  setSeatModalLoading,
  setSelectedSeatStructure,
} from "store/slices/movieSeatSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";
import dayjs from "dayjs";
import { SEAT_STRUCTURE_TYPES } from "constants/SeatTypes";
import ScheduleDetailForm from "../components/ScheduleDetailForm";
import MovieScheduler from "../components/MovieScheduler";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { resetState } from "store/slices/movieScheduleSlice";
const { Step } = Steps;

const ADD = "ADD";
const EDIT = "EDIT";

const ScheduleForm = (props) => {
  const { mode = ADD, seatId } = props;
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
  const { scheduledMovies, dateRange } = useSelector(
    (state) => state.movieScheduleSlice
  );

  // useEffect(() => {
  //   if (seatId && mode === EDIT) {
  //     dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
  //   } else {
  //     dispatch(resetState());
  //   }
  // }, [seatId, dispatch]);

  useEffect(() => {
    if (!form.validateFields) {
      dispatch(resetState());
    }
  }, [form]);
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // useEffect(() => {
  //   if (singleSeatStructure && mode === EDIT) {
  //     dispatch(
  //       getVenues({
  //         place_id: singleSeatStructure.venue.place.id,
  //         is_indoor: true,
  //       })
  //     );
  //     dispatch(setSelectedVenue(singleSeatStructure.venue));
  //     const values = {
  //       name: singleSeatStructure.name,
  //       venue_id: singleSeatStructure.venue.id,
  //       screen_id: singleSeatStructure.screen.id,
  //       place_id: singleSeatStructure.venue.place.id,
  //       place: `${singleSeatStructure.venue.place.name}, ${singleSeatStructure.venue.place.country.name}`,
  //     };
  //     form.setFieldsValue(values);
  //     if (
  //       singleSeatStructure.seat_data &&
  //       singleSeatStructure.seat_data.seats
  //     ) {
  //       dispatch(updateSeats(singleSeatStructure.seat_data.seats));

  //       if (singleSeatStructure.seat_data.seatTypes) {
  //         dispatch(
  //           loadSeatData({
  //             seats: singleSeatStructure.seat_data.seats,
  //             seatTypes: singleSeatStructure.seat_data.seatTypes,
  //           })
  //         );
  //       }
  //     }
  //   }
  // }, [form, singleSeatStructure, mode, dispatch]);

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(1);
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  dayjs.extend(isSameOrBefore);

  const handleSubmit = async () => {
    try {
      // const formValues = await form.validateFields();
      // console.log("Form values:", formValues);

      const startDate = dayjs(dateRange[0]);
      const endDate = dayjs(dateRange[1]);

      const datesList = [];
      let currentDate = startDate;
      while (!currentDate.isAfter(endDate, "day")) {
        datesList.push(currentDate.format("YYYY-MM-DD"));
        currentDate = currentDate.add(1, "day");
      }
      const restructuredData = {};
      datesList.forEach((dateString, index) => {
        const scheduledForDay = scheduledMovies[index] || [];

        if (scheduledForDay.length > 0) {
          restructuredData[dateString] = scheduledForDay.map((movie) => ({
            movieId: movie.movieId,
            screenId:
              typeof movie.screen === "object" ? movie.screen.id : movie.screen,
            startMinutes: movie.startMinutes,
            endMinutes: movie.endMinutes,
            intervals: movie.intervalTime || 15,
            seatStructureId: movie.seatStructureId || null,
            coupons: movie.coupons || [],
            offers: movie.offers || [],
          }));
        }
      });

      console.log("Restructured Data:", restructuredData);

      // setSubmitLoading(true);

      // if (mode === EDIT) {
      //   let totalVisibleSeats = 0;
      //   seats.forEach((row) => {
      //     row.forEach((seat) => {
      //       if (seat.isVisible) {
      //         totalVisibleSeats++;
      //       }
      //     });
      //   });

      //   const editData = {
      //     // ...formValues,
      //     id: singleSeatStructure.id,
      //     total_row: seats.length,
      //     total_column: seats[0]?.length || 0,
      //     total_seats: totalVisibleSeats,
      //     seat_data: {
      //       seats,
      //       seatTypes: usedSeatTypes,
      //     },
      //   };

      //   const resultAction = await dispatch(
      //     editSeatStructure({ data: editData, action: ActionType.WARNING })
      //   );

      //   if (editSeatStructure.fulfilled.match(resultAction)) {
      //     dispatch(setSelectedSeatStructure(editData));
      //     dispatch(setSeatDialogVisible(true));
      //   }
      // } else {
      //   let totalVisibleSeats = 0;
      //   seats.forEach((row) => {
      //     row.forEach((seat) => {
      //       if (seat.isVisible) {
      //         totalVisibleSeats++;
      //       }
      //     });
      //   });

      //   const combinedData = {
      //     // ...formValues,
      //     total_row: seats.length,
      //     total_column: seats[0]?.length || 0,
      //     total_seats: totalVisibleSeats,
      //     type: SEAT_STRUCTURE_TYPES.MOVIE,
      //     seat_data: {
      //       seats,
      //       seatTypes: usedSeatTypes,
      //     },
      //   };

      //   dispatch(setSelectedSubmitItem(combinedData));
      // }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      editSeatStructure({
        data: selectedSeatStructure,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setSeatModalLoading(true));
    const resultAction = await dispatch(
      editSeatStructure({
        data: selectedSeatStructure,
        action: ActionType.SUBMIT,
      })
    );
    dispatch(setSeatModalLoading(false));
    dispatch(setSeatDialogVisible(false));
    if (editSeatStructure.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedSeatStructure));
    }
  };

  const handleModalCancel = () => {
    dispatch(setSeatDialogVisible(false));
  };

  const renderContent = () => {
    return currentStep === 0 ? (
      <ScheduleDetailForm form={form} mode={mode} />
    ) : (
      <MovieScheduler form={form} />
    );
  };

  const renderActionButtons = () => {
    if (currentStep === 0) {
      return (
        <div className="flex justify-end mt-4">
          <DiscardButton form={form} className="mr-2" />
          <Button
            type="primary"
            onClick={handleNext}
            // disabled={areRequiredFieldsMissing()}
          >
            Next
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end mt-4">
          <Button className="mr-2" onClick={handleBack}>
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitLoading || loading}
          >
            Submit
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <div className="container ">
        <Card>
          <Steps current={currentStep} className="mb-4">
            <Step title="Theatre Selection" />
            <Step title="Schedule Layout" />
          </Steps>
          <Divider />
          <Form layout="vertical" form={form}>
            {renderContent()}
            {renderActionButtons()}
          </Form>
        </Card>
      </div>

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
        addFunction={mode === EDIT ? editSeatStructure : addSeatStructure}
        navigationPath={`${APP_PREFIX_PATH}/seat/movie/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />
    </>
  );
};

export default ScheduleForm;
