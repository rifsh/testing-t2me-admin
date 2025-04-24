import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Form, Button, message, Card, Steps, Divider, Modal } from "antd";
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
import { addMovieSchedule, resetState } from "store/slices/movieScheduleSlice";
import { restructureForAPI } from "../components/utils";
const { Step } = Steps;

const ADD = "ADD";
const EDIT = "EDIT";

const ScheduleForm = (props) => {
  const { mode = ADD, seatId } = props;
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValue, setFormValue] = useState({});

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
    scheduledMovies,
    dateRange,
  } = useSelector((state) => state.movieScheduleSlice);
  // const {  } = useSelector(
  //   (state) => state.movieScheduleSlice
  // );

  // useEffect(() => {
  //   if (seatId && mode === EDIT) {
  //     dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
  //   } else {
  //     dispatch(resetState());
  //   }
  // }, [seatId, dispatch]);

  useEffect(() => {
    dispatch(resetState());
  }, []);

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
      const formFields = form.getFieldsValue();
      console.log("formFields", formFields);
      setFormValue(formFields);
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
    setSubmitLoading(true);

    try {
      const formFields = form.getFieldsValue();

      // Get validation result along with payload
      const validationResult = restructureForAPI(formValue, scheduledMovies);

      // Handle validation failures
      if (!validationResult.isValid) {
        // Handle different validation errors
        if (validationResult.message === "Missing seat structure") {
          Modal.error(validationResult.details);
          console.error("Validation Failed: Missing seat structures");
          return;
        } else if (validationResult.message === "No scheduled movies") {
          Modal.error(validationResult.details);
          console.error("Validation Failed: No scheduled movies");
          return;
        }
      }

      // Handle empty dates warning
      if (validationResult.message === "Empty dates found") {
        // Check if there are gap dates (dates between scheduled dates that are empty)
        const hasGapDates =
          validationResult.details.emptyGapDates &&
          validationResult.details.emptyGapDates.length > 0;

        const hasEdgeDates =
          validationResult.details.emptyEdgeDates &&
          validationResult.details.emptyEdgeDates.length > 0;

        // If we only have edge dates (beginning/end), show a simpler confirmation
        if (hasEdgeDates && !hasGapDates) {
          Modal.confirm({
            title: validationResult.details.title,
            content: validationResult.details.content,
            okText: "Continue",
            cancelText: "Cancel",
            onOk: () => {
              proceedWithSubmission(validationResult.data);
            },
          });
          return;
        }

        // If we have gap dates, show a more detailed confirmation with different wording
        if (hasGapDates) {
          Modal.confirm({
            title: "Schedule Contains Empty Dates",
            content: validationResult.details.content,
            okText: "Continue with Gaps",
            cancelText: "Cancel",
            onOk: () => {
              proceedWithSubmission(validationResult.data);
            },
          });
          return;
        }
      }

      // If we got here, everything is valid
      proceedWithSubmission(validationResult.data);
    } catch (error) {
      console.error("Submission error:", error);
      message.error("An error occurred during submission. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper function to handle the actual submission
  const proceedWithSubmission = (apiPayload) => {
    console.log("API Payload:", apiPayload);

    if (mode === EDIT) {
      // Edit mode logic here
      // ...
    } else {
      // Create mode
      dispatch(setSelectedSubmitItem(apiPayload));
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
        addFunction={mode === EDIT ? editSeatStructure : addMovieSchedule}
        navigationPath={`${APP_PREFIX_PATH}/movie-schedule/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />
    </>
  );
};

export default ScheduleForm;
