import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  UserOutlined,
  CommentOutlined,
  CalendarOutlined,
  PercentageOutlined,
  TagOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
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
  Descriptions,
  Divider,
} from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { useParams, useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import {
  fetchOrganizerSingleEventUpdate,
  submitOrganizerEventUpdate,
  setCommentModalVisibility,
  setActionType,
  setComment,
  toggleComments,
} from "store/slices/EventOrganizerSlice";
import { APPROVAL_STATUS } from "constants/AppConstants";
import StatusTimelineCard from "components/layout-components/Cards/StatusTimelineCard ";

const { Title, Text, Paragraph } = Typography;

const OrganizerOfferDetail = () => {
  const { eventId, type } = useParams();
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
    if (eventId) {
      dispatch(fetchOrganizerSingleEventUpdate({ organizer_event_id: eventId }));
    }
  }, [dispatch, eventId]);

  const handleOpenModal = (action) => {
    dispatch(setActionType(action));
    dispatch(setCommentModalVisibility(true));
  };

  const handleMakeChanges = () => {
    navigate(
      `${APP_PREFIX_PATH}/event/edit/${eventId}/${type}?isMakeChange=${true}`
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
        organizer_event_id: eventId,
        status: getApprovalStatus(actionType),
        comment: comment,
      };

      const resultAction = await dispatch(
        submitOrganizerEventUpdate({
          data: data,
          params: { organizer_event_id: eventId },
          action: ActionType.WARNING,
        })
      );

      if (submitOrganizerEventUpdate.fulfilled.match(resultAction)) {
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchOrganizerSingleEventUpdate({ organizer_event_id: eventId }));
        navigate(`${APP_PREFIX_PATH}/track/event/status/list`);
      }
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const renderCommentList = () => {
    const comments = singleOrganizerUpdate?.organizer_offer_comments || [];

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
                title={<Text strong>{item.user?.username ?? "N/A"}</Text>}
                description={
                  <Paragraph style={{ marginBottom: 0 }}>{item.comment}</Paragraph>
                }
              />
            </List.Item>
          )}
        />
        {hasMoreComments && (
          <Button
            type="link"
            onClick={() => dispatch(toggleComments())}
            style={{ paddingLeft: 0 }}
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
        return "success";
      case APPROVAL_STATUS.REJECTED:
        return "error";
      case APPROVAL_STATUS.CHANGE_REQUEST:
        return "processing";
      case APPROVAL_STATUS.PENDING:
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderActionButtons = () => {
    const approvalStatus = singleOrganizerUpdate?.approval_status?.toLowerCase();

    if (
      approvalStatus === APPROVAL_STATUS.CHANGE_REQUEST &&
      currentUser.role_id === UserRoleConstants.eventOrganizerRoleId
    ) {
      return (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button
              type="primary"
              size="large"
              onClick={handleMakeChanges}
              icon={<InfoCircleOutlined />}
            >
              Make Changes
            </Button>
          </Space>
        </Row>
      );
    }

    if (
      approvalStatus === APPROVAL_STATUS.PENDING &&
      currentUser.role_id === UserRoleConstants.superAdminRoleId
    ) {
      return (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button
              danger
              size="large"
              onClick={() => handleOpenModal("reject")}
              icon={<CloseCircleOutlined />}
            >
              Reject
            </Button>
            <Button
              size="large"
              onClick={() => handleOpenModal("change request")}
              icon={<InfoCircleOutlined />}
            >
              Request Changes
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => handleOpenModal("approve")}
              icon={<CheckCircleOutlined />}
            >
              Approve
            </Button>
          </Space>
        </Row>
      );
    }

    return null;
  };

  if (!singleOrganizerUpdate) {
    return null;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header Card with Image and Status */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6}>
            <Image
              src={singleOrganizerUpdate?.thumbnail_image}
              alt="Offer Thumbnail"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
              fallback="/img/pexels-teddy-2263436.jpg"
            />
          </Col>
          <Col xs={24} md={18}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title level={3} style={{ margin: 0 }}>
                {singleOrganizerUpdate?.name || "N/A"}
              </Title>
              <Space wrap>
                <Tag
                  color={getStatusTagColor(singleOrganizerUpdate.approval_status)}
                  icon={
                    singleOrganizerUpdate.approval_status === "approved" ? (
                      <CheckCircleOutlined />
                    ) : singleOrganizerUpdate.approval_status === "rejected" ? (
                      <CloseCircleOutlined />
                    ) : (
                      <InfoCircleOutlined />
                    )
                  }
                >
                  {singleOrganizerUpdate.approval_status
                    ?.charAt(0)
                    .toUpperCase() +
                    singleOrganizerUpdate.approval_status?.slice(1).toLowerCase()}
                </Tag>
                <Tag
                  color={singleOrganizerUpdate.is_active ? "success" : "default"}
                >
                  {singleOrganizerUpdate.is_active ? "Active" : "Inactive"}
                </Tag>
              </Space>
              <Text type="secondary">
                Created: {formatDateTime(singleOrganizerUpdate?.created_at)}
              </Text>
            </Space>
          </Col>
        </Row>
        {renderActionButtons()}
      </Card>

      {/* Offer Details using Descriptions */}
      <Card title="Offer Details" style={{ marginTop: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item
            label={
              <Space>
                <PercentageOutlined />
                <span>Discount Type</span>
              </Space>
            }
          >
            <Tag color={singleOrganizerUpdate?.is_percentage ? "blue" : "cyan"}>
              {singleOrganizerUpdate?.is_percentage
                ? "Percentage"
                : "Fixed Amount"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <PercentageOutlined />
                <span>Discount Value</span>
              </Space>
            }
          >
            <Text strong>
              {singleOrganizerUpdate?.discount_percentage_amount || 0}
              {singleOrganizerUpdate?.is_percentage ? "%" : " units"}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <TagOutlined />
                <span>Offer Type</span>
              </Space>
            }
          >
            <Tag color={singleOrganizerUpdate?.is_general ? "green" : "orange"}>
              {singleOrganizerUpdate?.is_general
                ? "General Offer"
                : "Specific Offer"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <ShopOutlined />
                <span>Redemption Type</span>
              </Space>
            }
          >
            <Tag color={singleOrganizerUpdate?.is_offline ? "purple" : "blue"}>
              {singleOrganizerUpdate?.is_offline ? "Offline" : "Online"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                <span>Maximum Uses</span>
              </Space>
            }
          >
            <Text strong>
              {singleOrganizerUpdate?.max_uses || "Unlimited"}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                <span>Used Count</span>
              </Space>
            }
          >
            <Text strong>{singleOrganizerUpdate?.used_count || 0}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>Date Required</span>
              </Space>
            }
          >
            <Tag color={singleOrganizerUpdate?.date_required ? "blue" : "default"}>
              {singleOrganizerUpdate?.date_required ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>Start Date</span>
              </Space>
            }
          >
            {formatDate(singleOrganizerUpdate?.start_date)}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>End Date</span>
              </Space>
            }
          >
            {formatDate(singleOrganizerUpdate?.end_date)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Applicable Theatres */}
      {singleOrganizerUpdate?.theatre_ids &&
        singleOrganizerUpdate.theatre_ids.length > 0 && (
          <Card title="Applicable Theatres" style={{ marginTop: 16 }}>
            <Space wrap>
              {singleOrganizerUpdate.theatre_ids.map((theatreId) => (
                <Tag key={theatreId} color="blue">
                  Theatre ID: {theatreId}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

      {/* Keywords */}
      {singleOrganizerUpdate?.key_words &&
        singleOrganizerUpdate.key_words.length > 0 && (
          <Card title="Keywords" style={{ marginTop: 16 }}>
            <Space wrap>
              {singleOrganizerUpdate.key_words.map((keyword, index) => (
                <Tag key={index} color="cyan">
                  {keyword}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

      {/* Comments Section */}
      <Card
        title={
          <Space>
            <CommentOutlined />
            <span>Comments</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        {renderCommentList()}
      </Card>

      {/* Status Timeline */}
      <StatusTimelineCard
        createdAt={singleOrganizerUpdate.created_at}
        updatedAt={singleOrganizerUpdate.updated_at}
        status={singleOrganizerUpdate.approval_status}
      />

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
        warningMessage={`Please provide a reason for the update.`}
      />
    </div>
  );
};

export default OrganizerOfferDetail;
