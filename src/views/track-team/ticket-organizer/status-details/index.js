import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  UserOutlined,
  CommentOutlined,
  CalendarOutlined,
  TagOutlined,
  ShopOutlined,
  NumberOutlined,
  DollarOutlined,
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
  Divider,
  Descriptions,
} from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { useParams, useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import {
  submitOrganizerTicketUpdate,
  setCommentModalVisibility,
  setActionType,
  setComment,
  toggleComments,
  fetchOrganizerSingleTicket,
} from "store/slices/EventOrganizerSlice";
import { APPROVAL_STATUS } from "constants/AppConstants";
import StatusTimelineCard from "components/layout-components/Cards/StatusTimelineCard ";

const { Title, Text, Paragraph } = Typography;

const OrganizerOfferDetail = () => {
  const { ticketId, type } = useParams();
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
    if (ticketId) {
      dispatch(fetchOrganizerSingleTicket({ ticket_structure_id: ticketId }));
    }
  }, [dispatch, ticketId]);

  const handleOpenModal = (action) => {
    dispatch(setActionType(action));
    dispatch(setCommentModalVisibility(true));
  };

  const handleMakeChanges = () => {
    navigate(
      `${APP_PREFIX_PATH}/ticket/edit/${ticketId}?type=${type}&isMakeChange=${true}`
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
        ticket_id: ticketId,
        status: getApprovalStatus(actionType),
        comment: comment,
      };

      const resultAction = await dispatch(
        submitOrganizerTicketUpdate({
          data: data,
          params: { organizer_ticket_id: ticketId },
          action: ActionType.WARNING,
        })
      );

      if (submitOrganizerTicketUpdate.fulfilled.match(resultAction)) {
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchOrganizerSingleTicket({ ticket_structure_id: ticketId }));
        navigate(`${APP_PREFIX_PATH}/track/event-tickets/status/list/event`);
      }
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const renderCommentList = () => {
    const comments =
      singleOrganizerUpdate?.organizer_ticketstructure_comments || [];

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
                      <Paragraph>{item.comment}</Paragraph>
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
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const renderTicketTypes = () => {
    const ticketTypes = singleOrganizerUpdate?.organizer_ticket_types || [];

    if (ticketTypes.length === 0) {
      return <Text type="secondary">No ticket types available</Text>;
    }

    return (
      <Row gutter={[16, 16]}>
        {ticketTypes.map((ticketType) => (
          <Col xs={24} md={12} lg={8} key={ticketType.id}>
            <Card
              size="small"
              style={{
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  {ticketType.name}
                </Title>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ticket Set">
                    <Tag color="blue">{ticketType.ticket_set}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Price">
                    <Text strong>₹{ticketType.price}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Available">
                    <Text>{ticketType.number_of_tickets} tickets</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={ticketType.status ? "green" : "red"}>
                      {ticketType.status ? "Active" : "Inactive"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <Card>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              {singleOrganizerUpdate?.name || "Ticket Structure"}
            </Title>
            <Space>
              {singleOrganizerUpdate?.approval_status && (
                <Tag
                  color={getStatusTagColor(
                    singleOrganizerUpdate.approval_status
                  )}
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {singleOrganizerUpdate.approval_status
                    .charAt(0)
                    .toUpperCase() +
                    singleOrganizerUpdate.approval_status
                      .slice(1)
                      .toLowerCase()}
                </Tag>
              )}
              {singleOrganizerUpdate?.status !== undefined && (
                <Tag
                  color={singleOrganizerUpdate.status ? "green" : "red"}
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {singleOrganizerUpdate.status ? "Active" : "Inactive"}
                </Tag>
              )}
            </Space>
          </div>
        </Space>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space>
              <NumberOutlined />
              <Text type="secondary">Ticket Structure ID</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.id || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <ShopOutlined />
              <Text type="secondary">Venue ID</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.venue_id || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <UserOutlined />
              <Text type="secondary">User ID</Text>
            </Space>
            <div>
              <Text strong>{singleOrganizerUpdate?.user_id || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <NumberOutlined />
              <Text type="secondary">Total Tickets</Text>
            </Space>
            <div>
              <Text strong>
                {singleOrganizerUpdate?.number_of_tickets || 0}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <DollarOutlined />
              <Text type="secondary">Base Price</Text>
            </Space>
            <div>
              <Text strong>₹{singleOrganizerUpdate?.base_price || 0}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <TagOutlined />
              <Text type="secondary">Dynamic Pricing</Text>
            </Space>
            <div>
              <Tag
                color={singleOrganizerUpdate?.is_dynamic ? "blue" : "default"}
              >
                {singleOrganizerUpdate?.is_dynamic ? "Enabled" : "Disabled"}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Created At</Text>
            </Space>
            <div>
              <Text strong>
                {formatDate(singleOrganizerUpdate?.created_at)}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Updated At</Text>
            </Space>
            <div>
              <Text strong>
                {formatDate(singleOrganizerUpdate?.updated_at)}
              </Text>
            </div>
          </Col>
        </Row>

        {renderActionButtons()}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Ticket Types</Title>
        <Divider />
        {renderTicketTypes()}
      </Card>

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

      <StatusTimelineCard
        createdAt={singleOrganizerUpdate?.created_at}
        updatedAt={singleOrganizerUpdate?.updated_at}
        status={singleOrganizerUpdate?.approval_status}
      />
    </div>
  );
};

export default OrganizerOfferDetail;
