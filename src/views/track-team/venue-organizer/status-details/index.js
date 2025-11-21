import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  UserOutlined,
  CommentOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Space,
  List,
  Avatar,
  message,
  Tag,
  Image,
  Badge,
  Divider,
} from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { useParams, useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import {
  setCommentModalVisibility,
  setActionType,
  setComment,
  toggleComments,
  fetchOrganizerSingleVenue,
  submitOrganizerVenueUpdate,
} from "store/slices/EventOrganizerSlice";
import { APPROVAL_STATUS } from "constants/AppConstants";
import StatusTimelineCard from "components/layout-components/Cards/StatusTimelineCard ";

const { Title, Text, Paragraph } = Typography;

const OrganizerVenueDetail = () => {
  const { venueId, type } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const {
    singleOrganizerUpdate,
    loading,
    isCommentModalVisible,
    comment,
    actionType,
    showAllComments,
  } = useSelector((state) => state.organizerUpdates);

  useEffect(() => {
    if (venueId) {
      dispatch(fetchOrganizerSingleVenue({ organizer_venue_id: venueId }));
    }
  }, [dispatch, venueId]);

  const handleOpenModal = (action) => {
    dispatch(setActionType(action));
    dispatch(setCommentModalVisibility(true));
  };

  const handleMakeChanges = () => {
    navigate(
      `${APP_PREFIX_PATH}/venue/edit/${venueId}?type=${type}&isMakeChanges=${true}`
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
        organizer_venue_id: venueId,
        status: getApprovalStatus(actionType),
        comment: comment,
      };

      const resultAction = await dispatch(
        submitOrganizerVenueUpdate({
          data: data,
          params: { organizer_venue_id: venueId },
          action: ActionType.WARNING,
        })
      );

      if (submitOrganizerVenueUpdate.fulfilled.match(resultAction)) {
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchOrganizerSingleVenue({ organizer_venue_id: venueId }));
        navigate(`${APP_PREFIX_PATH}/track/venue/status/list`);
      }
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const renderCommentList = () => {
    const comments = singleOrganizerUpdate?.organizer_venue_comments || [];

    if (comments.length === 0) {
      return <Text type="secondary">No comments yet</Text>;
    }

    const displayComments = showAllComments ? comments : comments.slice(0, 3);
    const hasMoreComments = comments.length > 3;

    return (
      <div>
        <List
          itemLayout="horizontal"
          dataSource={displayComments}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{item.user?.username ?? "N/A"}</Text>
                    <Tag color="blue">{item.user?.role?.name}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph>{item.comment}</Paragraph>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {hasMoreComments && (
          <Button
            style={{ marginTop: "16px" }}
            onClick={() => dispatch(toggleComments())}
          >
            {showAllComments ? "Show Less Comments" : "Show More Comments"}
          </Button>
        )}
      </div>
    );
  };

  const getStatusTagColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case APPROVAL_STATUS.APPROVED:
        return "green";
      case APPROVAL_STATUS.REJECTED:
        return "red";
      case APPROVAL_STATUS.CHANGE_REQUEST:
        return "blue";
      case APPROVAL_STATUS.PENDING:
        return "orange";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderActionButtons = () => {
    const approvalStatus =
      singleOrganizerUpdate?.approval_status?.toLowerCase();

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
      currentUser.role_id === UserRoleConstants.superAdminRoleId
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
              Request Changes
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

  if (!singleOrganizerUpdate) {
    return <Text>Loading...</Text>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Venue Header Card */}
      <Card style={{ marginTop: 16 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Image
              src={
                singleOrganizerUpdate?.thumbnail_image ||
                "/img/pexels-teddy-2263436.jpg"
              }
              alt="Venue Thumbnail"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
              fallback="/img/pexels-teddy-2263436.jpg"
            />
          </Col>
          <Col xs={24} md={18}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Venue Name</Text>
                <div>
                  <Title level={3} style={{ margin: "8px 0 0 0" }}>
                    {singleOrganizerUpdate?.name || "N/A"}
                  </Title>
                </div>
              </div>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Text type="secondary">Approval Status</Text>
                  <div style={{ marginTop: 4 }}>
                    {singleOrganizerUpdate?.approval_status && (
                      <Tag
                        color={getStatusTagColor(
                          singleOrganizerUpdate.approval_status
                        )}
                      >
                        {singleOrganizerUpdate.approval_status
                          .charAt(0)
                          .toUpperCase() +
                          singleOrganizerUpdate.approval_status
                            .slice(1)
                            .toLowerCase()}
                      </Tag>
                    )}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary">Active Status</Text>
                  <div style={{ marginTop: 4 }}>
                    {singleOrganizerUpdate?.is_active !== undefined && (
                      <Tag
                        color={
                          singleOrganizerUpdate.is_active ? "green" : "red"
                        }
                      >
                        {singleOrganizerUpdate.is_active
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    )}
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary">Created At</Text>
                  <div>
                    <Text strong style={{ display: "block", marginTop: 4 }}>
                      {formatDate(singleOrganizerUpdate?.created_at)}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>
      {renderActionButtons()}
      {/* Venue Details Card */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Venue Information</Title>
        <Divider />
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space>
              <HomeOutlined />
              <Text type="secondary">Capacity</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.capacity || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <HomeOutlined />
              <Text type="secondary">Venue Type</Text>
            </Space>
            <div>
              <Text strong>
                {singleOrganizerUpdate?.indoor ? "Indoor" : "Outdoor"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <EnvironmentOutlined />
              <Text type="secondary">Location</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.place?.name || "N/A"}</Text>
            </div>
          </Col>

          {/* <Col xs={24}>
            <Text type="secondary">Description</Text>
            <Paragraph
              style={{ marginTop: 8 }}
              dangerouslySetInnerHTML={{
                __html: singleOrganizerUpdate.place.description || "N/A",
              }}
            />
          </Col> */}

          <Col xs={24} md={12}>
            <Space>
              <EnvironmentOutlined />
              <Text type="secondary">Address</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.address || "N/A"}</Text>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Space>
              <EnvironmentOutlined />
              <Text type="secondary">Coordinates</Text>
            </Space>
            <div>
              <Text strong>
                {singleOrganizerUpdate?.latitude &&
                singleOrganizerUpdate?.longitude
                  ? `${singleOrganizerUpdate.latitude.toFixed(
                      4
                    )}, ${singleOrganizerUpdate.longitude.toFixed(4)}`
                  : "N/A"}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Place Information Card */}
      {singleOrganizerUpdate?.place && (
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Location Details</Title>
          <Divider />
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Text type="secondary">Place Name</Text>
              <div>
                <Text strong>{singleOrganizerUpdate.place.name}</Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">Country</Text>
              <div>
                <Text strong>
                  {singleOrganizerUpdate.place.country?.name || "N/A"}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">Time Zone</Text>
              <div>
                <Text strong>
                  {singleOrganizerUpdate.place.country?.time_zone || "N/A"}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">Currency</Text>
              <div>
                <Text strong>
                  {singleOrganizerUpdate.place.country?.currency_code || "N/A"}
                </Text>
              </div>
            </Col>
            {/* <Col xs={24}>
              <Text type="secondary">Place Description</Text>
              <div style={{ marginTop: 8 }}>
                <Paragraph
                  style={{ marginTop: 8 }}
                  dangerouslySetInnerHTML={{
                    __html: singleOrganizerUpdate?.description || "N/A",
                  }}
                />
              </div>
            </Col> */}
          </Row>
        </Card>
      )}

      {/* Comments Card */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space>
            <CommentOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Comments & Timeline
            </Title>
          </Space>
          <Divider />
          {renderCommentList()}
        </Space>
      </Card>

      {/* Status Timeline Card */}
      <StatusTimelineCard
        createdAt={singleOrganizerUpdate.created_at}
        updatedAt={singleOrganizerUpdate.updated_at}
        status={singleOrganizerUpdate.approval_status}
      />

      {/* Action Buttons */}

      {/* Comment Modal */}
      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={handleSubmit}
        onCancel={() => dispatch(setCommentModalVisibility(false))}
        loading={loading}
        comment={comment}
        setComment={(value) => dispatch(setComment(value))}
        title={`${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } Comment`}
        warningMessage="Please provide a reason for your action."
      />
    </div>
  );
};

export default OrganizerVenueDetail;
