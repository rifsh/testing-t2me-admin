import React, { useEffect, useState } from 'react';
import { Badge, Card, Typography, Tag, Divider, Descriptions, Timeline, Button, Space, Row, Col, Tooltip, Modal, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTrackrequestSeatStructuresDetails } from 'store/slices/movieSeatSlice';
import { InfoCircleOutlined, } from '@ant-design/icons';
import ChairIcon from '@mui/icons-material/Chair';
import { getCurrentUser } from 'configs/UserAccessConfig';
import { APPROVAL_STATUS } from 'constants/AppConstants';
import { UserRoleConstants } from 'constants/UserRoleConstant';
import { setActionType, setComment, setCommentModalVisibility } from 'store/slices/EventOrganizerSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import CommentShowModal from 'components/util-components/ModalItems/CommentShowModal';
import { submitOrganizerMovieSeatUpdate } from 'store/slices/movieOrganizerSlice';
import { ActionType } from 'utils/api/warning-submit-util';
import ResponsiveSeatMap from '../components/ResponsiveSeatMap ';
import LoadingOverlay from 'components/util-components/Loader';
import StatusTimelineCard from 'components/layout-components/Cards/StatusTimelineCard ';
import { CommentListRender } from 'components/shared-components/Organizer/CommentListRender';
import { Box } from '@mui/material';
import usePermissions from 'utils/hooks/usePermissions';
import { PERMISSIONS } from 'constants/RolesPermissionConstants';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

export default function TheaterScreeningUI() {
    const { seatId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { TrackrequestSeatsDetails, loading } = useSelector(
        (state) => state.movieSeatSlice
    );
    const {
        loading: organizerLoading,
        isCommentModalVisible,
        comment,
        actionType,
    } = useSelector((state) => state.organizerUpdates);
    const [viewMode, setViewMode] = useState('info');
    const currentUser = getCurrentUser();
    const { hasPermission, hasAnyPermission } = usePermissions()

    useEffect(() => {
        if (seatId) {
            dispatch(getTrackrequestSeatStructuresDetails({ seat_id: seatId }))
        }
    }, [seatId, dispatch]);

    const getStatusBadge = (status) => {
        if (status === "pending") {
            return <Badge status="processing" text={<span className="font-medium">Pending Approval</span>} />;
        } else if (status === "approved") {
            return <Badge status="success" text={<span className="font-medium">Approved</span>} />;
        } else if (status === "rejected") {
            return <Badge status="error" text={<span className="font-medium">Rejected</span>} />;
        }
        return <Badge status="default" text={<span className="font-medium">{status}</span>} />;
    };

    const handleOpenModal = (action) => {
        dispatch(setActionType(action));
        dispatch(setCommentModalVisibility(true));
    };

    const handleMakeChanges = () => {
        navigate(
            `${APP_PREFIX_PATH}/seat/movie/edit/${seatId}/organizer`
        );
    };

    const getApprovalStatus = (action) => {
        switch (action) {
            case "approve":
                return APPROVAL_STATUS.APPROVED;
            case "reject":
                return APPROVAL_STATUS.REJECTED;
            case "change request":
                return APPROVAL_STATUS.CHANGE_REQUEST;
            default:
                return APPROVAL_STATUS.PENDING;
        }
    };

    const handleSubmit = async () => {
        if (comment.trim().length === 0) {
            message.error("Please add a comment!");
            return;
        }

        try {
            const data = {
                seat_id: seatId,
                status: getApprovalStatus(actionType),
                comment: comment,
            };
            console.log(data)
            const resultAction = await dispatch(
                submitOrganizerMovieSeatUpdate({
                    data: data,
                    params: { seat_id: seatId },
                    action: ActionType.WARNING,
                })
            );

            if (submitOrganizerMovieSeatUpdate.fulfilled.match(resultAction)) {
                message.success(`Update ${actionType}ed successfully`);
                dispatch(getTrackrequestSeatStructuresDetails({ seat_id: seatId }));
                navigate(`${APP_PREFIX_PATH}/track/moive-seats/status/list`);
            }
        } catch (error) {
            message.error(`Failed to ${actionType} the update`);
        }

        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
    };

    const renderActionButtons = () => {
        if (loading || !TrackrequestSeatsDetails) return null;

        const approvalStatus =
            TrackrequestSeatsDetails?.approval_status?.toLowerCase();

        if (
            approvalStatus === APPROVAL_STATUS.CHANGE_REQUEST &&
            hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SEAT.ORGANIZER_MOVIE_SEAT_STRUCTURE_CHANGE)
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
            hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SEAT.APPROVE_ORGANIZER_MOVIE_SEAT_STRUCTURE_CHANGE)
        ) {
            console.log("TrackrequestSeatsDetails", approvalStatus);

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
        <div className=" bg-gray-50 min-h-screen">
            {/* Maker-Checker Actions */}
            <div className='flex items-center justify-end'>
                {renderActionButtons()}
            </div>
            <Card
                className="rounded-lg overflow-hidden border-0"
                title={
                    <div className="flex justify-between items-center me-10">
                        <div>
                            <Title level={4} className="mb-0">
                                {TrackrequestSeatsDetails.name}
                                <Tag color="blue" className="ml-2">
                                    {TrackrequestSeatsDetails.type}
                                </Tag>
                            </Title>
                        </div>
                        <div>
                            {getStatusBadge(TrackrequestSeatsDetails.approval_status)}
                        </div>
                    </div>
                }
                extra={
                    <Space>
                        <Button
                            type={viewMode === 'info' ? 'primary' : 'default'}
                            icon={<InfoCircleOutlined />}
                            onClick={() => setViewMode('info')}
                        >
                            Details
                        </Button>
                        <Button
                            type={viewMode === 'preview' ? 'primary' : 'default'}
                            icon={<ChairIcon />}
                            onClick={() => setViewMode('preview')}
                        >
                            Seat Preview
                        </Button>
                    </Space>
                }
            >
                {viewMode === 'info' ? (
                    <>
                        <Row gutter={24} >
                            <Col xs={24} sm={24} lg={12}>
                                <Card title="Theatre Information" className="h-full" bordered={false}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Theatre Name">
                                            <Text strong>{TrackrequestSeatsDetails.theatre?.name}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Description">
                                            <div dangerouslySetInnerHTML={{ __html: TrackrequestSeatsDetails.theatre?.description }} />
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} lg={12} >
                                <Card title="Venue Details" className="h-full" bordered={false}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Venue Name">
                                            <Text strong>{TrackrequestSeatsDetails.venue?.name}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Description">
                                            <div dangerouslySetInnerHTML={{ __html: TrackrequestSeatsDetails.venue?.description }} />
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        <div className="mt-6 bg-white shadow rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Screen Information</h2>
                            <div className="flex flex-col md:flex-row md:justify-between gap-6">

                                {/* Column 1 */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="text-gray-500 text-sm">Screen Name</p>
                                        <p className="font-semibold text-black">{TrackrequestSeatsDetails.screen?.screen_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Capacity</p>
                                        <p className='text-black'>{TrackrequestSeatsDetails.screen?.capacity} seats</p>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Rows</p>
                                        <p className='text-black'>{TrackrequestSeatsDetails.total_row}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Columns</p>
                                        <p className='text-black'>{TrackrequestSeatsDetails.total_column}</p>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Seats</p>
                                        <p className='text-black'>{TrackrequestSeatsDetails.total_seats}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Creation Date</p>
                                        <p className='text-black'>{new Date(TrackrequestSeatsDetails.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <StatusTimelineCard
                            createdAt={TrackrequestSeatsDetails.created_at}
                            updatedAt={TrackrequestSeatsDetails.updated_at}
                            status={TrackrequestSeatsDetails.approval_status}
                        />
                    </>
                ) : (
                    <div>
                        <Card title="Seat Layout Preview" bordered={false}>
                            <ResponsiveSeatMap TrackrequestSeatsDetails={TrackrequestSeatsDetails} />
                        </Card>
                    </div>
                )}

                <Divider />
            </Card>

            {TrackrequestSeatsDetails?.organizer_theatre_seat_structure_comment &&
                (Array.isArray(TrackrequestSeatsDetails.organizer_theatre_seat_structure_comment) ? (
                    <Box className="">
                        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
                            Review Comments
                        </Typography>
                        {TrackrequestSeatsDetails.organizer_theatre_seat_structure_comment.map((comment, index) => (
                            <React.Fragment key={index}>
                                <Divider className="mb-4" />
                                <CommentListRender comment={comment} />
                            </React.Fragment>
                        ))}
                    </Box>
                ) : (
                    <CommentListRender comment={TrackrequestSeatsDetails.organizer_theatre_seat_structure_comment} />
                ))}


            <LoadingOverlay loading={loading} />

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
}