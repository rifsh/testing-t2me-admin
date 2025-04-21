import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Space, List, Avatar, Button, Spin, Alert, Select, message, Image } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchIssueDetails,
  IssueReasignComment,
  IssueStatusUpdate,
  IssueReasignUpdate,
  IssueCloseUpdate,
  fetchCommentDetails
} from 'store/slices/IssueSlice';
import {
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  FileTextOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import CommentShowModal from 'components/util-components/ModalItems/CommentShowModal';
import { getCurrentUser } from 'configs/UserAccessConfig';
import moment from 'moment';
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const IssueDetails = () => {
  const { issueId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [modalPurpose, setModalPurpose] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(null)
  const { IssueDetails, loading, error, CommentDetails } = useSelector((state) => state.issue);


  useEffect(() => {
    if (issueId) {
      dispatch(fetchCommentDetails({ size: 5, page: 1, issue_id: issueId }));
  
      dispatch(fetchIssueDetails(issueId));
    }

    return()=>{
      if (!IssueDetails){
        navigate(`${APP_PREFIX_PATH}/alerts/list`);
      }

    }
  }, [dispatch, issueId]);
  
  const renderCommentList = () => {
    if (!CommentDetails?.items|| CommentDetails.items.length === 0) {
      return <Text type="secondary">No comments yet</Text>;
    }
    const isMoreCommentsAvailable = CommentDetails.size < CommentDetails.total;

    return (
      <div>
     <List
  itemLayout="horizontal"
  dataSource={CommentDetails.items}
  renderItem={(item) => (
    <List.Item>
  <List.Item.Meta
    avatar={<Avatar icon={<UserOutlined />} />}
    title={
      <Space>
        <Text strong>{item.users.username}</Text>
      </Space>
    }
    description={
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Paragraph>{item.comment}</Paragraph>
          <Text type="secondary">
            {moment(item.created_at).fromNow()}
          </Text>
        </div>
        {item.issue_comment_file?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginLeft: "10px" }}>
            {item.issue_comment_file.map((files, index) => (
              <Image
                key={index}
                src={files.file} // Replace with the correct file URL property
                alt={`Comment attachment ${index + 1}`}
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                preview={true} // Allows clicking for a larger preview
              />
            ))}
          </div>
        )}
      </div>
    }
  />
</List.Item>

  )}
/>
      {/* Button for more comments */}
      <Button
        style={{ marginTop: '16px' }}
        onClick={() => {
          if (isMoreCommentsAvailable) {
            dispatch(fetchCommentDetails({
              size: CommentDetails.size + 5,
              page: 1,
              issue_id: issueId
            }));
          } else if (CommentDetails.size > 5) {
            dispatch(fetchCommentDetails({
              size: Math.max(CommentDetails.size - 5, 5), 
              page: 1,
              issue_id: issueId
            }));
          }
        }}
      >
        {isMoreCommentsAvailable ? "More Comments" : "Less Comments"}
      </Button>
    </div>
  );
};
  const handleOpenModal = (purpose) => {
    setModalPurpose(purpose);
    setIsCommentModalVisible(true);
  };

  const handleChange = async (newStatus) => {
    try {
      const resultAction = await dispatch(
        IssueStatusUpdate({
          IssueId: IssueDetails.id,
          data: { issue_status: newStatus },
        })
      );

      if (IssueStatusUpdate.fulfilled.match(resultAction)) {
        message.success(`Status updated to ${newStatus}`);
        dispatch(fetchIssueDetails(issueId));
      }
    } catch (error) {
      message.error("Failed to update issue status:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    try {
      let formData = new FormData();

      formData.append("comment", comment);
      if (uploadingFiles) {
        uploadingFiles.forEach((file) => {
          formData.append("files", file.originFileObj); 
        });
      } 
      const resultAction = await dispatch(
        IssueReasignComment({
          IssueId: IssueDetails.id,
          data: formData,
        })
      );
      if (IssueReasignComment.fulfilled.match(resultAction)) {
        const reassignAction = await dispatch(
          IssueReasignUpdate({
            IssueId: IssueDetails.id,
            data: { assigned_role: true },
          })
        );

        if (IssueReasignUpdate.fulfilled.match(reassignAction)) {
          console.warn("Reassigned successfully", reassignAction.payload);
          message.success(
            `Issue reassigned to ${IssueDetails.role_assignable}, the issue will no longer be available in your dashboard`
          );
          navigate(`${APP_PREFIX_PATH}/alerts/list`);
        }
      }
    } catch (error) {
      message.error("Failed to reassign the issue", error);
    }

    setComment('');
    setIsCommentModalVisible(false);
  };

  const handleCloseTicket = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    try {
      let formData = new FormData();

      formData.append("comment", comment);
      
      
      const resultAction = await dispatch(
        IssueReasignComment({
          IssueId: IssueDetails.id,
          data: formData,
        })
      );

      if (IssueReasignComment.fulfilled.match(resultAction)) {
      const resultAction = await dispatch(
        IssueCloseUpdate({
          IssueId: IssueDetails.id,
          data: { issue_close: true },
        })
      );

      if (IssueCloseUpdate.fulfilled.match(resultAction)) {
        message.success("Ticket closed");
        navigate(`${APP_PREFIX_PATH}/alerts/list`);
      }
    }
    } catch (error) {
      message.error("Failed to close the ticket:", error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      OPEN: 'warning',
      IN_PROGRESS: 'processing',
      RESOLVED: 'success',
      CLOSED: 'default',
    };
    return statusColors[status?.toUpperCase()] || 'default';
  };

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;
  if (!IssueDetails) return <Alert message="No Issue Details Found" type="info" showIcon />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header Section */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>{IssueDetails.subject}</Title>
            </Col>
            <Col>
  {/* {IssueDetails.status_changable && !IssueDetails.ticket_status &&(
    <Select
      value={IssueDetails?.issue_status}
      onChange={handleChange}
      style={{
        minWidth: 120,
        border: `1px solid ${getStatusColor(IssueDetails.issue_status)}`,
        borderRadius: 4,
      }}
      dropdownStyle={{ border: "none" }} // Customize dropdown border if needed
    >
      {IssueDetails?.issue_status_list?.map((status) => (
        <Option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Option>
      ))}
    </Select>
  )} */}
</Col>

          </Row>
          
          <Space size="large" wrap>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">Created {IssueDetails?.item?.created_at}</Text>
            </Space>
            <Space>
              <UserOutlined />
              <Text type="secondary">Raised by {IssueDetails?.user?.username}</Text>
            </Space>
            {/* <Space>
              <TagOutlined />
              <Text type="secondary">Assigned Role {IssueDetails?.role?.name}</Text>
            </Space> */}
            <Space>
              <UserOutlined />
              Assigned to
              <Text
                strong
                style={{
                  color:
                    IssueDetails?.ticket_assigned?.id && 
                    getCurrentUser().id === IssueDetails?.re_assigned_to?.id || 
                    (getCurrentUser().id === IssueDetails?.ticket_assigned?.id && IssueDetails?.re_assigned_to == null)
                                          ? 'rgb(7, 201, 4)'
                      : '',
                }}
                type="secondary"
              >
                {IssueDetails?.re_assigned_to?.username 
                  ? IssueDetails.re_assigned_to.username 
                  : IssueDetails?.ticket_assigned?.username}
              </Text>
            </Space>
          </Space>
        </Space>
      </Card>

      {/* Description Section */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <FileTextOutlined />
            <Title level={4} style={{ margin: 0 }}>Issue Description</Title>
          </Space>
          <Text>{IssueDetails.issue}</Text>
        </Space>
      </Card>

      {/* Event Details Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Event Information</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Text type="secondary">Event Name</Text>
            <div>
              <Text strong>{IssueDetails?.event?.event_name}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Issue Status</Text>
            <div>
            <Text strong>{IssueDetails?.issue_status?.charAt(0).toUpperCase() + IssueDetails?.issue_status?.slice(1)}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Assigned Role</Text>
            <div>
              <Text strong>{IssueDetails?.role?.name}</Text>
            </div>
          </Col>
        </Row>
      </Card>
      {/* Action Buttons */}
      {/* <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
  {!IssueDetails.ticket_status &&
    (IssueDetails.assignable ? (
      <Col>
        <Button
          size="large"
          className="text-primary"
          onClick={() => handleOpenModal('reassign')}
        >
          Re-Assign to {IssueDetails.role_assignable}
        </Button>
      </Col>
    ) : (
      !IssueDetails.ticket_closable && (
        <Col>
          <Button
            className="text-primary"
            size="large"
            onClick={() => handleOpenModal('close')}
          >
            Close Ticket
          </Button>
        </Col>
      )
    ))}
</Row> */}

      {/* Comments Section */}
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

      {/* Comment Modal */}
      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={modalPurpose === 'reassign' ? handleSubmitComment : handleCloseTicket}
        onCancel={() => setIsCommentModalVisible(false)}
        loading={false}
        comment={comment}
        setComment={setComment}
        title={modalPurpose === 'reassign' ? 'Reassignment Comment' : 'Closing Comment'}
        warningMessage={
          modalPurpose === 'reassign'
            ? 'Please provide a reason for reassigning the ticket.'
            : 'Close the ticket with comment'
        }
        showFileUpload={modalPurpose === 'reassign' ?true:false} // Enable file upload
        onFileChange={(files) => setUploadingFiles(files)}
      />
    </div> 
  );
};

export default IssueDetails;
