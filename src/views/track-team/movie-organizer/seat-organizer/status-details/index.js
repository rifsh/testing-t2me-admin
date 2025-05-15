import { useEffect, useState } from 'react';
import { Badge, Card, Typography, Tag, Divider, Descriptions, Timeline, Button, Space, Row, Col, Tooltip, Modal, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTrackrequestSeatStructuresDetails } from 'store/slices/movieSeatSlice';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { isOrganizer } from 'configs/UserAccessConfig';
import { APPROVAL_STATUS } from 'constants/AppConstants';
import { currentUser } from 'auth/FirebaseAuth';
import { UserRoleConstants } from 'constants/UserRoleConstant';
import { setActionType, setComment, setCommentModalVisibility } from 'store/slices/EventOrganizerSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import CommentShowModal from 'components/util-components/ModalItems/CommentShowModal';
import { submitOrganizerMovieSeatUpdate } from 'store/slices/movieOrganizerSlice';
import { ActionType } from 'utils/api/warning-submit-util';
import ResponsiveSeatMap from '../components/ResponsiveSeatMap ';
import LoadingOverlay from 'components/util-components/Loader';

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
        singleOrganizerUpdate,
        loading: organizerLoading,
        isCommentModalVisible,
        comment,
        actionType,
        showAllComments,
    } = useSelector((state) => state.organizerUpdates);
    const [viewMode, setViewMode] = useState('info'); // 'info' or 'preview'

    useEffect(() => {
        dispatch(getTrackrequestSeatStructuresDetails({ seat_id: seatId }))
    }, [seatId, dispatch]);

    if (!TrackrequestSeatsDetails) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-2xl text-gray-400">Loading theater details...</div>
                </div>
            </div>
        );
    }

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
            `${APP_PREFIX_PATH}/offer/edit/${seatId}?type=movie`
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
        const approvalStatus =
            TrackrequestSeatsDetails?.approval_status?.toLowerCase();

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
        <div className=" bg-gray-50 min-h-screen">
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
                            icon={<EyeOutlined />}
                            onClick={() => setViewMode('preview')}
                        >
                            Preview
                        </Button>
                    </Space>
                }
            >
                {viewMode === 'info' ? (
                    <>
                        <Row gutter={24}>
                            <Col span={12}>
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
                            <Col span={12}>
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

                        <Card title="Screen Information" className="mt-6" bordered={false}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Screen Name">
                                            <Text strong>{TrackrequestSeatsDetails.screen?.screen_name}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Capacity">
                                            <Text>{TrackrequestSeatsDetails.screen?.capacity} seats</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={8}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Total Rows">
                                            <Text>{TrackrequestSeatsDetails.total_row}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Total Columns">
                                            <Text>{TrackrequestSeatsDetails.total_column}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={8}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Total Seats">
                                            <Text>{TrackrequestSeatsDetails.total_seats}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Creation Date">
                                            <Text>{new Date(TrackrequestSeatsDetails.created_at).toLocaleDateString()}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Timeline" className="mt-6" bordered={false}>
                            <Timeline>
                                <Timeline.Item color="blue">
                                    Created on {new Date(TrackrequestSeatsDetails.created_at).toLocaleString()}
                                </Timeline.Item>
                                <Timeline.Item color="orange">
                                    Last updated on {new Date(TrackrequestSeatsDetails.updated_at).toLocaleString()}
                                </Timeline.Item>
                                <Timeline.Item color={TrackrequestSeatsDetails.approval_status === "pending" ? "gray" :
                                    TrackrequestSeatsDetails.approval_status === "approved" ? "green" : "red"}>
                                    {TrackrequestSeatsDetails.approval_status === "pending" ? "Awaiting approval" :
                                        TrackrequestSeatsDetails.approval_status === "approved" ? "Approved" : "Rejected"}
                                </Timeline.Item>
                            </Timeline>
                        </Card>
                    </>
                ) : (
                    <div>
                        <Card title="Seat Layout Preview" bordered={false}>
                            <ResponsiveSeatMap TrackrequestSeatsDetails={TrackrequestSeatsDetails} />
                        </Card>
                    </div>
                )}

                <Divider />

                {/* Maker-Checker Actions */}
                {!isOrganizer() && <div className="flex justify-end mt-4">
                    <Space>
                        {renderActionButtons()}
                    </Space>
                </div>}
            </Card>

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