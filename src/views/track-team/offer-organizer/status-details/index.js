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
} from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { useParams, useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import {
  fetchOrganizerSingleOfferUpdate,
  submitOrganizerOfferUpdate,
  setCommentModalVisibility,
  setActionType,
  setComment,
  toggleComments,
} from "store/slices/EventOrganizerSlice";

const { Title, Text, Paragraph } = Typography;

const OrganizerOfferDetail = () => {
  const { offerId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Sample data provided in JSON
  const offerData = {
    status: true,
    created_at: "2025-05-07T14:05:33.326687",
    updated_at: "2025-05-07T14:05:33.326691",
    name: "image test123",
    start_date: null,
    end_date: null,
    max_uses: 2,
    is_general: true,
    date_required: false,
    thumbnail_image: "images",
    key_words: [],
    is_percentage: true,
    is_offline: false,
    discount_percentage_amount: 32,
    id: 2,
    is_active: false,
    used_count: 0,
    theatre_ids: [18, 23],
    event_ids: null,
    approval_status: "pending",
    organizer_offer_comments: [],
  };

  const {
    singleOrganizerUpdate,
    loading,
    isCommentModalVisible,
    comment,
    actionType,
    showAllComments,
  } = useSelector((state) => state.organizerUpdates);

  // Use merged data - combining Redux store data with our sample data
  const mergedData = { ...singleOrganizerUpdate, ...offerData };

  useEffect(() => {
    if (offerId) {
      dispatch(fetchOrganizerSingleOfferUpdate({ offer_id: offerId }));
    }
  }, [dispatch, offerId]);

  const handleOpenModal = (action) => {
    dispatch(setActionType(action));
    dispatch(setCommentModalVisibility(true));
  };

  const handleMakeChanges = () => {
    navigate(
      `${APP_PREFIX_PATH}/track-team/event-organizer/update-edit/${offerId}`
    );
  };

  const getApprovalStatus = (action) => {
    switch (action) {
      case "approve":
        return "approved";
      case "reject":
        return "rejected";
      case "update":
        return "change request";
      default:
        return "pending";
    }
  };

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    try {
      const data = {
        offer_id: offerId,
        status: getApprovalStatus(actionType),
        comment: comment,
      };

      const resultAction = await dispatch(
        submitOrganizerOfferUpdate({
          data: data,
          params: { offer_id: offerId },
          action: ActionType.WARNING,
        })
      );

      if (submitOrganizerOfferUpdate.fulfilled.match(resultAction)) {
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchOrganizerSingleOfferUpdate({ offer_id: offerId }));
        navigate(`${APP_PREFIX_PATH}/track/offer/status/list?type=movie`);
      }
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const renderCommentList = () => {
    const comments = mergedData?.organizer_offer_comments || [];

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
                  </Space>
                }
                description={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <Paragraph>{item.content}</Paragraph>
                    </div>
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
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "update":
        return "blue";
      case "pending":
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
    const approvalStatus = mergedData?.approval_status?.toUpperCase();

    if (
      approvalStatus === "UPDATES" &&
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
      approvalStatus === "PENDING" &&
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
              onClick={() => handleOpenModal("update")}
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Offer Information</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Text type="secondary">Offer Name</Text>
            <div>
              <Text strong>{mergedData?.name || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Created At</Text>
            <div>
              <Text strong>{formatDate(mergedData?.created_at)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Status</Text>
            <div>
              {mergedData?.approval_status && (
                <Tag color={getStatusTagColor(mergedData.approval_status)}>
                  {mergedData.approval_status.charAt(0).toUpperCase() +
                    mergedData.approval_status.slice(1).toLowerCase()}
                </Tag>
              )}
              {mergedData?.is_active !== undefined && (
                <Tag
                  color={mergedData.is_active ? "green" : "red"}
                  style={{ marginLeft: 8 }}
                >
                  {mergedData.is_active ? "Active" : "Inactive"}
                </Tag>
              )}
            </div>
          </Col>
          {renderActionButtons()}
        </Row>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Offer Details</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space>
              <PercentageOutlined />
              <Text type="secondary">Discount Type</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.is_percentage ? "Percentage" : "Fixed Amount"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <PercentageOutlined />
              <Text type="secondary">Discount Value</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.discount_percentage_amount || 0}
                {mergedData?.is_percentage ? "%" : " units"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <TagOutlined />
              <Text type="secondary">Offer Type</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.is_general ? "General Offer" : "Specific Offer"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <ShopOutlined />
              <Text type="secondary">Redemption Type</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.is_offline ? "Offline" : "Online"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <UserOutlined />
              <Text type="secondary">Maximum Uses</Text>
            </Space>
            <div>
              <Text strong>{mergedData?.max_uses || "Unlimited"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <UserOutlined />
              <Text type="secondary">Used Count</Text>
            </Space>
            <div>
              <Text strong>{mergedData?.used_count || 0}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Date Required</Text>
            </Space>
            <div>
              <Text strong>{mergedData?.date_required ? "Yes" : "No"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Start Date</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.start_date
                  ? formatDate(mergedData.start_date)
                  : "Not specified"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">End Date</Text>
            </Space>
            <div>
              <Text strong>
                {mergedData?.end_date
                  ? formatDate(mergedData.end_date)
                  : "Not specified"}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {mergedData?.theatre_ids && mergedData.theatre_ids.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Applicable Theatres</Title>
          <Row gutter={[16, 16]}>
            {mergedData.theatre_ids.map((theatreId) => (
              <Col key={theatreId}>
                <Tag color="blue">Theatre ID: {theatreId}</Tag>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {mergedData?.key_words && mergedData.key_words.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Keywords</Title>
          <Row gutter={[16, 16]}>
            {mergedData.key_words.map((keyword, index) => (
              <Col key={index}>
                <Tag color="cyan">{keyword}</Tag>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {mergedData?.thumbnail_image && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Offer Thumbnail
              </Title>
            </Space>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Image
                src={mergedData.thumbnail_image}
                alt="Offer Thumbnail"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                fallback="/api/placeholder/400/300"
              />
            </div>
          </Space>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space>
            <CommentOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Comments
            </Title>
          </Space>
          {renderCommentList()}
        </Space>
      </Card>

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
