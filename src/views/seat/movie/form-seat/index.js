import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";

import DiscardButton from "components/shared-components/Buttons/DiscardButton";

import { useSelector, useDispatch } from "react-redux";
import MovieSeatDetailForm from "../components/MovieSeatDetailForm";
import { SEAT_STRUCTURE_TYPES } from "constants/SeatTypes";
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
  resetState,
  getTrackrequestSeatStructuresDetails,
  makeEditSeatStructure,
} from "store/slices/movieSeatSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";
import { fetchScreenData } from "store/slices/screenSlice";
import TheaterLayout from "views/seat/components/TheaterLayout";
import { getCurrentUser, isOrganizer } from "configs/UserAccessConfig";
import { fetchTheaterByid } from "store/slices/theaterSlice";
import { nestedToFlat } from "utils/seatUtils";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { setComment, setCommentModalVisibility } from "store/slices/EventOrganizerSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";

const ADD = "ADD";
const EDIT = "EDIT";

const SeatForm = (props) => {
  const { mode = ADD, seatId, pageType } = props;
  const dispatch = useDispatch();
  const currentUser = getCurrentUser();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const { selectedTheaterId, singleResponse } = useSelector(
    (state) => state.theater
  );
  const {
    singleOrganizerUpdate,
    loading: organizerLoading,
    isCommentModalVisible,
    comment,
    actionType,
    responseDataEvent, responseMessageEvent } = useSelector((state) => state.organizerUpdates);
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
      if (pageType) {
        dispatch(getTrackrequestSeatStructuresDetails({ seat_id: seatId }));
      } else {
        dispatch(getMovieSeatStructureDetails({ seat_id: seatId }));
      }
    } else {
      dispatch(resetState());
    }

    return () => {
      dispatch(resetState());
    };
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
          place_id: singleSeatStructure?.venue?.place?.id,
          is_indoor: true,
        })
      );
      dispatch(setSelectedVenue(singleSeatStructure.venue));
      const values = {
        name: singleSeatStructure?.name,
        venue_id: singleSeatStructure?.venue?.id,
        screen_id: singleSeatStructure?.screen?.id,
        place_id: singleSeatStructure?.venue?.place?.id,
        theatre_id: singleSeatStructure?.theatre?.id,
        place: `${singleSeatStructure?.venue?.place?.name}, ${singleSeatStructure?.venue?.place?.country?.name}`,
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

  useEffect(() => {
    if (isOrganizer()) {
      dispatch(
        fetchTheaterByid({
          theatre_id: selectedTheaterId
            ? selectedTheaterId
            : singleSeatStructure?.theatre?.id,
        })
      );
    }
  }, [selectedTheaterId, singleSeatStructure]);

  const onFinish = async () => {
    if (activeTabKey === "1") {
      setActiveTabKey("2");
      return;
    }
    try {
      const formValues = await form.validateFields();
      console.log(formValues, "FORM VALUES");

      setSubmitLoading(true);

      if (mode === EDIT) {
        if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId && pageType) {
          dispatch(setCommentModalVisibility(true));
          return;
        }
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

        if (pageType) {
          try {
            const resultAction = await dispatch(
              makeEditSeatStructure({ data: editData, action: ActionType.WARNING })
            );

            if (makeEditSeatStructure.fulfilled.match(resultAction)) {
              dispatch(setSelectedSeatStructure(editData));
              dispatch(setSeatDialogVisible(true));
            }
          } catch (error) {
            console.error('Error in makeEditSeatStructure:', error);
          }
        } else {
          try {
            const resultAction = await dispatch(
              editSeatStructure({ data: editData, action: ActionType.WARNING })
            );

            if (editSeatStructure.fulfilled.match(resultAction)) {
              dispatch(setSelectedSeatStructure(editData));
              dispatch(setSeatDialogVisible(true));
            }
          } catch (error) {
            console.error('Error in editSeatStructure:', error);
          }
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

        if (isOrganizer()) {
          const combinedData = {
            ...formValues,
            place: singleResponse?.place?.id,
            venue_id: singleResponse?.venue?.id,
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
          return;
        }

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

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }
    const formValues = await form.validateFields();

    try {
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
        id: singleSeatStructure.id,
        comment: comment,
        place: singleResponse?.place?.id,
        venue_id: singleResponse?.venue?.id,
        total_row: seats.length,
        total_column: seats[0]?.length || 0,
        total_seats: totalVisibleSeats,
        type: SEAT_STRUCTURE_TYPES.MOVIE,
        seat_data: {
          seats: nestedToFlat(seats),
          seatTypes: usedSeatTypes,
        },
      };
      console.log("...............", combinedData);
      const resultAction = await dispatch(
        makeEditSeatStructure({ data: combinedData, action: ActionType.SUBMIT })
      );

      if (makeEditSeatStructure.fulfilled.match(resultAction)) {
        console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEssss");
        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
        dispatch(setSelectedSubmitItem(combinedData));
        message.success(`Update ${actionType}ed successfully`);
        // navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`);
      }
      dispatch(setSelectedSubmitItem(combinedData));
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
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
                children: <TheaterLayout type={"MOVIE"} />,
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
          mode === EDIT
            ? (pageType ? makeEditSeatStructure : editSeatStructure)
            : addSeatStructure
        } navigationPath={`${APP_PREFIX_PATH}/seat/movie/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />

      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={handleSubmit}
        onCancel={() => dispatch(setCommentModalVisibility(false))}
        loading={organizerLoading}
        comment={comment}
        setComment={(value) => dispatch(setComment(value))}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Comment`}
        warningMessage={`Please provide a reason for the update.`}
      />
    </>
  );
};

export default SeatForm;
