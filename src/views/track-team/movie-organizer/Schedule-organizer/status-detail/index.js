import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";
import { getMovieScheduleDetails, getOrganizerMovieScheduleDetail, submitOrganizerMovieScheduleUpdate } from "store/slices/movieScheduleSlice";
import {
    FaCalendarAlt,
    FaClock,
    FaTheaterMasks,
    FaMapMarkerAlt,
    FaStar,
    FaGlobe,
    FaCouch,
} from "react-icons/fa";
import StatusTimelineCard from "components/layout-components/Cards/StatusTimelineCard ";
import { setActionType, setComment, setCommentModalVisibility } from "store/slices/EventOrganizerSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { APPROVAL_STATUS } from "constants/AppConstants";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { getCurrentUser } from "configs/UserAccessConfig";
import { Button, Col, message, Row } from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import OrganizerlUtils from "utils/organizerUtils";
import { ActionType } from "utils/api/warning-submit-util";

const ScheduleDetails = () => {
    const { scheduleId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const { singleOrganizerSchedule, loading } =
        useSelector((state) => state.movieScheduleSlice);
    const {
        loading: organizerLoading,
        isCommentModalVisible,
        comment,
        actionType,
    } = useSelector((state) => state.organizerUpdates);

    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        dispatch(getOrganizerMovieScheduleDetail({ schedule_id: scheduleId }))
    }, [dispatch]);

    useEffect(() => {
        console.log("singleOrganizerSchedule", singleOrganizerSchedule)
    }, [singleOrganizerSchedule]);

    if (loading) {
        return <Loading />;
    }

    if (!singleOrganizerSchedule) {
        return <div className="text-center p-8">No schedule data found</div>;
    }

    const uniqueDates = singleOrganizerSchedule.movie_show
        ? [...new Set(singleOrganizerSchedule.movie_show.map((show) => show.movie_date))]
        : [];

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return dayjs(`2000-01-01T${timeString}`).format("h:mm A");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dayjs(dateString).format("MMMM D, YYYY");
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return "-";
        return dayjs(dateString).format("MMM D");
    };

    const handleDateClick = (date) => {
        setSelectedDate(date === selectedDate ? null : date);
    };

    const filteredShows =
        selectedDate && singleOrganizerSchedule.organizer_movie_show
            ? singleOrganizerSchedule.organizer_movie_show.filter(
                (show) => show.movie_date === selectedDate
            )
            : singleOrganizerSchedule.organizer_movie_show || [];

    const isOvernight = (show) => {
        if (!show) return false;
        const startHour = parseInt(show.start_time.split(":")[0]);
        const endHour = parseInt(show.end_time.split(":")[0]);
        return startHour > endHour || (startHour < 6 && endHour < 6);
    };

    const handleOpenModal = (action) => {
        dispatch(setActionType(action));
        dispatch(setCommentModalVisibility(true));
    };

    const handleMakeChanges = () => {
        navigate(
            `${APP_PREFIX_PATH}/seat/movie/edit/${scheduleId}/organizer`
        );
    };

    const handleSubmit = async () => {
        if (comment.trim().length === 0) {
            message.error("Please add a comment!");
            return;
        }
        const data = {
            schedule_id: scheduleId,
            status: OrganizerlUtils.getApprovalStatus(actionType),
            comment: comment,
        };
        console.log(data)

        try {
            const resultAction = await dispatch(
                submitOrganizerMovieScheduleUpdate({
                    data: data,
                    params: { schedule_id: scheduleId },
                    action: ActionType.WARNING,
                })
            );

            if (submitOrganizerMovieScheduleUpdate.fulfilled.match(resultAction)) {
                message.success(`Update ${actionType}ed successfully`);
                dispatch(getOrganizerMovieScheduleDetail({ schedule_id: scheduleId }));
                navigate(`${APP_PREFIX_PATH}/track/moive-schedule/status/list/movie`);
            }
        } catch (error) {
            message.error(`Failed to ${actionType} the update`);
        }

        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
    };

    const renderActionButtons = () => {
        if (loading || !singleOrganizerSchedule) return null;

        const approvalStatus =
            singleOrganizerSchedule?.approval_status?.toLowerCase();

        if (
            approvalStatus === APPROVAL_STATUS.CHANGE_REQUEST &&
            currentUser.role_id === UserRoleConstants.eventOrganizerRoleId
        ) {
            return (
                <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
                    <Col>
                        <Button
                            size="large"
                            className="text-primary"
                            onClick={handleMakeChanges}
                        >
                            Make Changes
                        </Button>
                    </Col>
                </Row>
            );
        }

        if (
            approvalStatus === APPROVAL_STATUS.PENDING &&
            currentUser?.role_id === UserRoleConstants.superAdminRoleId
        ) {
            return (
                <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
                    <Col>
                        <Button
                            size="large"
                            className="text-primary"
                            onClick={() => handleOpenModal("reject")}
                        >
                            Reject
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            className="text-primary"
                            size="large"
                            onClick={() => handleOpenModal("change request")}
                        >
                            Update
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            className="text-primary"
                            size="large"
                            onClick={() => handleOpenModal("approve")}
                        >
                            Approve
                        </Button>
                    </Col>
                </Row>
            );
        }

        return null;
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Maker-Checker Actions */}
            <div className='flex items-center justify-end py-6'>
                {renderActionButtons()}
            </div>
            {/* Header */}
            <div className="bg-gray-800 text-white p-5 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl text-white font-bold mb-2">{singleOrganizerSchedule?.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt /> {formatDate(singleOrganizerSchedule.start_date)} to{" "}
                                {formatDate(singleOrganizerSchedule.end_date)}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaTheaterMasks /> {singleOrganizerSchedule.theatre?.name}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaMapMarkerAlt /> {singleOrganizerSchedule.venue?.name},{" "}
                                {singleOrganizerSchedule.theatre.place?.name}
                            </span>
                        </div>
                    </div>
                    <span className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {singleOrganizerSchedule.approval_status}
                    </span>
                </div>
            </div>

            {/* Date selector */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold">Movie Shows</h2>
                </div>

                {uniqueDates.length > 0 && (
                    <div className="p-4 overflow-x-auto">
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!selectedDate ? "bg-gray-800 text-white" : "bg-gray-200"
                                    }`}
                                onClick={() => setSelectedDate(null)}
                            >
                                All Shows
                            </button>
                            {uniqueDates.map((date) => (
                                <button
                                    key={date}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedDate === date
                                        ? "bg-gray-800 text-white"
                                        : "bg-gray-200"
                                        }`}
                                    onClick={() => handleDateClick(date)}
                                >
                                    {formatDateShort(date)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Shows Container - Grid View */}
            <div className="mb-6">
                {filteredShows.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
                        No shows available for the selected date.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredShows.map((show) => (
                            <ShowCard
                                key={show.id}
                                show={show}
                                formatTime={formatTime}
                                formatDate={formatDate}
                                isOvernight={isOvernight}
                            />
                        ))}
                    </div>
                )}
            </div>
            <StatusTimelineCard
                createdAt={singleOrganizerSchedule.created_at}
                updatedAt={singleOrganizerSchedule.updated_at}
                status={singleOrganizerSchedule.approval_status}
            />

            <CommentShowModal
                visible={isCommentModalVisible}
                onSubmit={handleSubmit}
                onCancel={() => dispatch(setCommentModalVisibility(false))}
                loading={organizerLoading}
                comment={comment}
                setComment={(value) => dispatch(setComment(value))}
                title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)
                    } Comment`}
                warningMessage={`Please provide a reason for the update.`}
            />
        </div>
    );
};

// Simplified Show Card Component
const ShowCard = ({ show, formatTime, formatDate, isOvernight }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex">
                {/* Movie Image */}
                {show.movie && show.movie.thumbnail_image && (
                    <div className="w-1/3 relative">
                        <img
                            src={show.movie.thumbnail_image}
                            alt={show.movie.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {show.movie_status}
                            </span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="w-2/3 p-4 flex flex-col">
                    {/* Title and Rating */}
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                            {show.movie ? show.movie.title : "Unknown Movie"}
                        </h3>
                        <div className="flex items-center text-sm bg-yellow-100 px-2 py-1 rounded">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span>{show.movie ? show.movie.rating : "N/A"}/10</span>
                        </div>
                    </div>

                    {/* Genre Tags */}
                    {show.movie && show.movie.genre && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {show.movie.genre.slice(0, 2).map((genre, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                                >
                                    {genre}
                                </span>
                            ))}
                            {show.movie.genre.length > 2 && (
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                    +{show.movie.genre.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Movie Details */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-1 text-sm">
                            <FaClock className="text-gray-600" />
                            <span>
                                {formatTime(show.start_time)} - {formatTime(show.end_time)}
                            </span>
                            {isOvernight(show) && (
                                <span className="ml-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                                    Overnight
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <FaCalendarAlt className="text-gray-600" />
                            <span>{formatDate(show.movie_date)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-sm">
                            <div className="flex items-center">
                                <FaCouch className="text-gray-600 mr-1" />
                                <span>{show.screen ? show.screen.screen_name : "Unknown"}</span>
                            </div>
                            <span className="mx-1">•</span>
                            <div className="flex items-center">
                                <FaGlobe className="text-gray-600 mr-1" />
                                <span>{show.movie ? show.movie.language : "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tech Specs */}
                    {show.screen &&
                        (show.screen.screen_technology || show.screen.audio) && (
                            <div className="flex flex-wrap gap-1 text-xs mb-3">
                                {show.screen.screen_technology && (
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        {show.screen.screen_technology?.name}
                                    </span>
                                )}
                                {show.screen.audio && (
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        {show.screen.audio?.name}
                                    </span>
                                )}
                            </div>
                        )}

                    {/* Ticket Status */}
                    <div className="mt-auto">
                        <span
                            className={`inline-block text-center py-2 px-4 rounded-md text-sm font-medium ${show.is_online_ticket
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {show.is_online_ticket
                                ? "Online Tickets Available"
                                : "Box Office Only"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetails;
