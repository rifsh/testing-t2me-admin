import React, { useEffect , useState} from 'react';
import { Card, Row, Col, Typography, Space,Input , Tag, Divider, List, Avatar, Button, Spin, Alert ,Select, message} from 'antd';
import { Option } from 'antd/es/mentions';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIssueDetails,IssueReasignComment, IssueStatusUpdate, IssueReasignUpdate,IssueCloseUpdate } from 'store/slices/IssueSlice';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  TagOutlined, 
  FileTextOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { getCurrentUser } from 'configs/UserAccessConfig';
const { Title, Text ,Paragraph } = Typography;
const { TextArea } = Input;

const IssueDetails = () => {
  const { issueId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [commentBox, setCommentBox] = useState(false)
  const [comment, setComment] = useState('');
  const { IssueDetails, loading, error } = useSelector((state) => state.issue);

  useEffect(() => {
    if (issueId && !IssueDetails) {
      dispatch(fetchIssueDetails(issueId));
    }
  }, [dispatch, issueId, IssueDetails]);
  const renderCommentList = () => {
    if (!IssueDetails?.comment || IssueDetails.comment.length === 0) {
      return (
        <Text type="secondary">No comments yet</Text>
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={IssueDetails.comment}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar icon={<UserOutlined />} />
              }
              title={
                <Space>
                  <Text strong>{item.users.username}</Text>
                  {/* <Tag className="text-sm" color="blue">{item.users.role.name}</Tag> */}
                </Space>
              }
              description={
                <div>
                  <Paragraph>{item.comment}</Paragraph>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  const handleChange = async (newStatus) => {
    try {
      // Dispatch the status update action and wait for it to complete
      const resultAction = await dispatch(
        IssueStatusUpdate({
          IssueId: IssueDetails.id,
          data: { issue_status: newStatus },
        })
      );
      // Check if the update was successful
      if (IssueStatusUpdate.fulfilled.match(resultAction) ) {
        message.success(`status updated to ${newStatus}`)
        // If successful, navigate to the issue list page
        dispatch(fetchIssueDetails(issueId))
      }
    } catch (error) {
      message.error("Failed to update issue status:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (comment.length == 0){
      message.error("Please Add comment !!!");
      return 
    }
    try {
      // Dispatch the status update action and wait for it to complete
      const resultAction = await dispatch(
        IssueReasignComment({
          IssueId: IssueDetails.id,
          data: { comment: comment },
        })
      );
      // Check if the update was successful
      if (IssueReasignComment.fulfilled.match(resultAction) ) {
        try {
          // Dispatch the status update action and wait for it to complete
          const resultAction = await dispatch(
            IssueReasignUpdate({
              IssueId: IssueDetails.id,
              data: { assigned_role: true },
            })
          );
          // Check if the update was successful
          if (IssueReasignUpdate.fulfilled.match(resultAction) ) {
            message.success(`Issue Reassigned to ${IssueDetails.role_assignable}, the issue will be no more available in your dashboard`)
            // If successful, navigate to the issue list page
            navigate(`${APP_PREFIX_PATH}/issue/list`);
          }
        } catch (error) {
          message.error("Failed to Reassign the issue", error);
        }
      }
    } catch (error) {
      message.error("Failed to add comment:", error);
    }
    
    setComment('');
    setCommentBox(false);
  };
  
const handleCloseTicket = async ()=>{
  try {
    const resultAction = await dispatch(
      IssueCloseUpdate({
        IssueId: IssueDetails.id,
        data: { issue_close: true },
      })
    );
    // Check if the update was successful
    if (IssueCloseUpdate.fulfilled.match(resultAction) ) {
      message.success(`Ticket Closed`)
      // If successful, navigate to the issue list page
      navigate(`${APP_PREFIX_PATH}/issue/list`);

    }
  } catch (error) {
    message.error("Failed to accept the issue:", error);
  }
};

  

  const getStatusColor = (status) => {
    const statusColors = {
      'OPEN': 'warning',
      'IN_PROGRESS': 'processing',
      'RESOLVED': 'success',
      'CLOSED': 'default'
    };
    return statusColors[status?.toUpperCase()] || 'default';
  };

  if (loading) return (
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
  {IssueDetails.status_changable && !IssueDetails.ticket_status &&(
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
  )}
</Col>

          </Row>
          
          <Space size="large" wrap>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">Created {new Date().toLocaleDateString()}</Text>
            </Space>
            <Space>
              <UserOutlined />
              <Text type="secondary">Raised by {IssueDetails?.user?.username}</Text>
            </Space>
            {/* <Space>
              <TagOutlined />
              <Text type="secondary">Assigned Role {IssueDetails?.role?.name}</Text>
            </Space> */}
            {IssueDetails?.assigned_to &&<Space>
              <UserOutlined />
              Assigned to
              <Text
              strong
  style={{
    color:
      IssueDetails?.assigned_to?.id && getCurrentUser().id === IssueDetails.assigned_to.id
        ? 'rgb(7, 201, 4)'
        : '',
  }}
  type="secondary"
>
   {IssueDetails?.assigned_to?.username}
</Text>

            </Space>}
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
      <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
      {/* {IssueDetails && IssueDetails.acceptable &&  (
          <Col>
          <Button onClick={handleAccept} type="primary" size="large">
            Accept Issue
          </Button>
        </Col>
        )} */}
  {
  !IssueDetails.ticket_status && (
    IssueDetails && IssueDetails.assignable ? (
      <Col>
        {commentBox ? (
          <Button size="large" disabled>
            Re-Assign to {IssueDetails.role_assignable}
          </Button>
        ) : (
          <Button
            size="large"
            className="text-primary"
            onClick={() => setCommentBox(true)}
          >
            Re-Assign to {IssueDetails.role_assignable}
          </Button>
        )}
      </Col>
    ) : (
      !IssueDetails.ticket_closable && ( // Check for ending status
        <Col>
          <Button
            className="text-primary"
            size="large"
            onClick={handleCloseTicket}
          >
            Close Ticket
          </Button>
        </Col>
      )
    )
  )
}

      </Row>
      {commentBox && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5}>Reassignment Comment</Title>
            <TextArea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please enter your reassignment comment..."
            />
            <Row justify="end" gutter={[16, 0]}>
              <Col>
                <Button onClick={() => {
                  setCommentBox(false);
                  setComment('');
                }}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" onClick={handleSubmitComment}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>
      )}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <CommentOutlined />
            <Title level={4} style={{ margin: 0 }}>Comments</Title>
          </Space>
          <Divider />
          {renderCommentList()}
        </Space>
      </Card>
    </div>
  );
};

export default IssueDetails;