import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import moment from 'moment';
import {
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  FileTextOutlined,
  CommentOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { Button, Row, Col, Card, Typography, Space, List, Avatar, message, Tag, Image } from "antd";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import { useParams, useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import {
  fetchSingleOrganizerUpdate,
  submitOrganizerUpdate
} from "store/slices/EventOrganizerSlice";

const { Title, Text, Paragraph } = Typography;

const DummyDataExample = () => {
  const { eventUpId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { singleOrganizerUpdate, loading } = useSelector((state) => state.organizerUpdates);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    if (eventUpId) {
      dispatch(fetchSingleOrganizerUpdate(eventUpId));
    }
  }, [dispatch, eventUpId]);

  const handleOpenModal = (action) => {
    setActionType(action);
    setIsCommentModalVisible(true);
  };

  const getApprovalStatus = (action) => {
    switch (action) {
      case 'approve':
        return 'APPROVED';
      case 'reject':
        return 'REJECTED';
      case 'update':
        return 'UPDATE';
      default:
        return 'PENDING';
    }
  };

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    try {
      const data = {
        update_id: eventUpId,
        approval: getApprovalStatus(actionType),
        comments: comment,
      };

      const resultAction = await dispatch(
        submitOrganizerUpdate({

          data: data,

          action: ActionType.WARNING
        })
      );

      if (submitOrganizerUpdate.fulfilled.match(resultAction)) {
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchSingleOrganizerUpdate(eventUpId));
        navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`);

      }
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    setComment('');
    setIsCommentModalVisible(false);


  };
  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  const renderCommentList = () => {
    if (!singleOrganizerUpdate?.related_comments || singleOrganizerUpdate?.related_comments.length === 0) {
      return <Text type="secondary">No comments yet</Text>;
    }

    const comments = singleOrganizerUpdate?.related_comments;
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            style={{ marginTop: '16px' }}
            onClick={toggleComments}
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
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'update':
        return 'blue';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const renderActionButtons = () => {
    if (singleOrganizerUpdate?.approval_status?.toUpperCase() === 'PENDING') {
      return (
        <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
          <Col>
            <Button
              size="large"
              className="text-primary"

              onClick={() => handleOpenModal('reject')}
            >
              Reject
            </Button>
          </Col>
          <Col>
            <Button
              className="text-primary"

              size="large"
              onClick={() => handleOpenModal('update')}
            >
              Update
            </Button>
          </Col>
          <Col>
            <Button
              className="text-primary"
              size="large"
              onClick={() => handleOpenModal('approve')}
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Request Information</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Text type="secondary">Organizer Name</Text>
            <div>
              <Text strong>{singleOrganizerUpdate.organizer?.username ?? "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Event Name</Text>
            <div>
              <Text strong>{singleOrganizerUpdate?.events?.event_name ?? "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Status</Text>
            <div>
              {singleOrganizerUpdate?.approval_status && (
                <Tag color={getStatusTagColor(singleOrganizerUpdate.approval_status)}>
                  {singleOrganizerUpdate.approval_status.charAt(0).toUpperCase() +
                    singleOrganizerUpdate.approval_status.slice(1).toLowerCase()}
                </Tag>
              )}
            </div>
          </Col>
        </Row>
      </Card>
      {renderActionButtons()}


      {singleOrganizerUpdate?.updated_fields && (
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Updated Information</Title>
          <Row gutter={[24, 24]}>
            {singleOrganizerUpdate.updated_fields?.event_name && (
              <Col xs={24} md={8}>
                <Text type="secondary">Event Name</Text>
                <div>
                  <Text strong>{singleOrganizerUpdate?.updated_fields?.event_name}</Text>
                </div>
              </Col>
            )}
            {singleOrganizerUpdate.updated_fields?.description && (
              <Col xs={24} md={8}>
                <Text type="secondary">Event Description</Text>
                <div>
                  <Text strong>{singleOrganizerUpdate.updated_fields?.description}</Text>
                </div>
              </Col>
            )}
          </Row>

        </Card>
      )}

      {singleOrganizerUpdate?.updated_fields?.thumbnail_image && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>

              <Title level={4} style={{ margin: 0 }}>
                Updated Thumbnail
              </Title>
            </Space>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Image
                src={singleOrganizerUpdate.updated_fields.thumbnail_image}
                alt="Updated Event Thumbnail"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                fallback="/api/placeholder/400/300"
              />
            </div>
          </Space>
        </Card>
      )}

      {singleOrganizerUpdate?.updated_fields?.banner_images &&
        singleOrganizerUpdate.updated_fields.banner_images.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>

                <Title level={4} style={{ margin: 0 }}>
                  Updated Banner Images
                </Title>
              </Space>
              <Row gutter={[16, 16]}>
                {singleOrganizerUpdate.updated_fields.banner_images.map((bannerUrl, index) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={index}>
                    <Image
                      src={bannerUrl}
                      alt={`Banner Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        )}


      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
        onCancel={() => setIsCommentModalVisible(false)}
        loading={loading}
        comment={comment}
        setComment={setComment}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Comment`}
        warningMessage={`Please provide a reason for the update.`}
      />
    </div>
  );
};

export default DummyDataExample;