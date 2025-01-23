import React, { useEffect, useState } from 'react';
import { Card, Row,Collapse, Col, Typography, Space, List, Avatar, Button, Spin, Alert, Select, message, Image } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers, resetRoleState, resetUserstate } from 'store/slices/userSlice';
import {
  fetchIssueDetails,
  IssueReasignComment,
  IssueStatusUpdate,
  IssueReasignUpdate,
  IssueCloseUpdate,
  fetchCommentDetails,
  FetchAssignmentDetails
} from 'store/slices/IssueSlice';
import {
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  RightOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import CommentShowModal from 'components/util-components/ModalItems/CommentShowModal';
import { getCurrentUser } from 'configs/UserAccessConfig';
import moment from 'moment';
import { fetchAllRoles } from 'store/slices/userSlice';
import { UserRoleConstants } from 'constants/UserRoleConstant';
import { TextConstants } from 'constants/TextConstant';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const IssueDetails = () => {
  const { issueId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [inputForFetchingRole, setInputForFetchingRole] = useState(false);
  const [comment, setComment] = useState('');
  const [modalPurpose, setModalPurpose] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  const { IssueDetails, loading, error, CommentDetails, AssignmentDetails } = useSelector((state) => state.issue);
  const { roles, list } = useSelector((state) => state.users);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (issueId) {
      dispatch(fetchCommentDetails({ size: 5, page: 1, issue_id: issueId }));
      dispatch(fetchIssueDetails(issueId));
      dispatch(FetchAssignmentDetails(issueId));
    }
  }, [issueId, dispatch]);

  // Reset selections when modal closes
  useEffect(() => {
    if (!isCommentModalVisible) {
      setSelectedUserId(null);
      if (!inputForFetchingRole) {
        setSelectedRoleId(null);
      }
    }
  }, [isCommentModalVisible, inputForFetchingRole]);

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
      message.error("Failed to update issue status");
    }
  };

  const handleCancelReassignAdmin = () => {
    setInputForFetchingRole(false);
    setSelectedRoleId(null);
    setSelectedUserId(null);
    dispatch(resetRoleState());
    dispatch(resetUserstate());
  };

  const handlefetchRoleDetails = async () => {
    setInputForFetchingRole(true);
    try {
      const hasEvent = IssueDetails.event && Object.keys(IssueDetails.event).length > 0;

      if (currentUser.role_id === UserRoleConstants.superAdminRoleId) {
        if (hasEvent) {
          await dispatch(fetchAllRoles({ "event": true }));
        } else {
          await dispatch(fetchAllRoles({ "event": false }));
        }
      } else {
        if (hasEvent) {
          await dispatch(fetchAllRoles({ "role_id": currentUser.role_id, "event": true }));
        } else {
          await dispatch(fetchAllRoles({ "role_id": currentUser.role_id, "event": false }));
        }
      }
    } catch (error) {
      message.error("Failed to fetch roles");
    }
  };
  const handlefetchUserDataByRole = async (roleId) => {
    setSelectedRoleId(roleId);
    setSelectedUserId(null);
    dispatch(resetUserstate());
    
    try {
      if (roleId === UserRoleConstants.eventSupportingTeamRoleId && IssueDetails.event) {
        await dispatch(fetchAllUsers({
          "role_id": roleId,
          "event_id": IssueDetails.event.id
        }));
      } else {
        await dispatch(fetchAllUsers({"role_id": roleId}));
      }
    } catch (error) {
      message.error("Failed to fetch users");
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    handleOpenModal(userId, 'reassign');
  };

  const handleOpenModal = (value, purpose) => {
    setModalPurpose(purpose);
    setSelectedUserId(value);
    setIsCommentModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsCommentModalVisible(false);
    setComment('');
    setUploadingFiles(null);
    setSelectedUserId(null);
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      message.error("Please add a comment!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("comment", comment);
      
      if (uploadingFiles) {
        uploadingFiles.forEach((file) => {
          formData.append("files", file.originFileObj);
        });
      }

      const commentAction = await dispatch(
        IssueReasignComment({
          IssueId: IssueDetails.id,
          data: formData
        })
      );

      if (IssueReasignComment.fulfilled.match(commentAction)) {
        const reassignAction = await dispatch(
          IssueReasignUpdate({
            IssueId: IssueDetails.id,
            CommentId: commentAction.payload.data,
            UserId: selectedUserId,
            data: { assigned_role: true },
          })
        );

        if (IssueReasignUpdate.fulfilled.match(reassignAction)) {
          message.success("Issue successfully reassigned");
          navigate(`${APP_PREFIX_PATH}/issue/list`);
        }
      }
    } catch (error) {
      message.error("Failed to reassign the issue");
    }

    handleCloseModal();
  };

  const handleCloseTicket = async () => {
    if (!comment.trim()) {
      message.error("Please add a comment!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("comment", comment);

      const commentAction = await dispatch(
        IssueReasignComment({
          IssueId: IssueDetails.id,
          data: formData,
        })
      );

      if (IssueReasignComment.fulfilled.match(commentAction)) {
        const closeAction = await dispatch(
          IssueCloseUpdate({
            IssueId: IssueDetails.id,
            data: { issue_close: true },
          })
        );

        if (IssueCloseUpdate.fulfilled.match(closeAction)) {
          message.success("Ticket closed successfully");
          navigate(`${APP_PREFIX_PATH}/issue/list`);
        }
      }
    } catch (error) {
      message.error("Failed to close the ticket");
    }

    handleCloseModal();
  };

  const renderAssignmentTimeline = () => {
    if (!AssignmentDetails?.length) return null;
  
    return (
      <Space direction="horizontal" size="small" style={{ width: '100%' }}>
        {AssignmentDetails.map((assignment, index) => (
          <Space key={index} align="center" style={{ width: '100%' }}>
            <Card style={{ flex: 1 }} className="assignment-card">
              <Space direction="vertical">
                <Text strong>{assignment.assigned_user.email}</Text>
                <Text type="secondary">{assignment.assigned_role.name}</Text>
                <Text type="secondary">
                  {moment(assignment.created_at).format('MMM DD, YYYY HH:mm')}
                </Text>
              </Space>
            </Card>
            {index < AssignmentDetails.length - 1 && (
              <RightOutlined style={{ color: '#999' }} />
            )}
          </Space>
        ))}
      </Space>
    );
  };

  const renderCommentList = () => {
    if (!CommentDetails?.items || CommentDetails.items.length === 0) {
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
                      <p>{item.comment}</p>
                      <Text type="secondary">
                        {moment(item.created_at).fromNow()}
                      </Text>
                    </div>
                    {item.issue_comment_file?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginLeft: "10px" }}>
                        {item.issue_comment_file.map((files, index) => (
                          <Image
                            key={index}
                            src={files.file}
                            alt={`Comment attachment ${index + 1}`}
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            preview={true}
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
        {isMoreCommentsAvailable && (
          <Button
            style={{ marginTop: '16px' }}
            onClick={() => {
              dispatch(fetchCommentDetails({
                size: CommentDetails.size + 5,
                page: 1,
                issue_id: issueId
              }));
            }}
          >
            More Comments
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;
  if (!IssueDetails) return <Alert message="No Issue Details Found" type="info" showIcon />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {IssueDetails.event_support_available === false && (
        <Alert
          message="There are no event supporting team members available for this specific event."
          type="warning"
          showIcon
          closable
          style={{padding:"20px"}}
        />
      )}

      {/* Header Card */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>{IssueDetails.subject}</Title>
            </Col>
            <Col>
              {IssueDetails.status_changable && !IssueDetails.ticket_status && (
                <Select
                  value={IssueDetails?.issue_status}
                  onChange={handleChange}
                  style={{ minWidth: 120 }}
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
              <Text type="secondary">
                Created {moment(IssueDetails?.created_at).format('MMM DD, YYYY')} 
              </Text>
            </Space>

            <Space direction="vertical">
              <Space>
                <UserOutlined />
                <Text type="secondary">
                  Raised by {IssueDetails?.user?.email || IssueDetails.email}
                </Text>
              </Space>
              {IssueDetails?.user?.username && IssueDetails?.user?.role?.name && (
                <Text type="secondary">Role: {IssueDetails.user.role.name}</Text>
              )}
            </Space>

            <Space>
              <UserOutlined />
              <Text>
                {IssueDetails.ticket_status ? "Closed By" : "Assigned to"}{' '}
                <Text
                  strong
                  style={{
                    color: (IssueDetails?.ticket_assigned?.id && currentUser.id === IssueDetails?.ticket_assigned?.id)
                      ? '#07c904'
                      : 'inherit'
                  }}
                >
                  {IssueDetails?.ticket_assigned?.email}
                </Text>
              </Text>
            </Space>
          </Space>
        </Space>
      </Card>

      {/* Description Card */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <FileTextOutlined />
            <Title level={4} style={{ margin: 0 }}>Issue Description</Title>
          </Space>
          <Text>{IssueDetails.issue}</Text>
        </Space>
      </Card>

      {/* Event Information Card */}
      {IssueDetails?.event && (
        <Card style={{ marginTop: 16 }}>
          <Title level={4}>Event Information</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Text type="secondary">Event Name</Text>
              <div>
                <Text strong>{IssueDetails.event.event_name}</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">Issue Status</Text>
              <div>
                <Text strong>
                  {IssueDetails?.issue_status?.charAt(0).toUpperCase() + IssueDetails?.issue_status?.slice(1)}
                </Text>
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
      )}

      {/* Assignment Timeline Card */}
      {AssignmentDetails?.length > 0 && (
        <Card style={{ marginTop: 16 }}>
           <Collapse ghost>
           <Panel header={<Title level={4}>Assignment History</Title>} key="1">
          <Title level={4}>Assignment History</Title>
          {renderAssignmentTimeline()}
          </Panel>
        </Collapse>
        </Card>
      )}


      {/* Action Buttons */}
      <Row justify="center" style={{ marginTop: 24 }} gutter={[16, 16]}>
        {!IssueDetails.ticket_status && (
          <>
            {(IssueDetails.assignable || IssueDetails.role_assignable_for_admin) && (
              <Col>
                <Button
                  size="large"
                  type="primary"
                  onClick={!inputForFetchingRole ? handlefetchRoleDetails : handleCancelReassignAdmin}
                >
                  {!inputForFetchingRole ? "Reassign" : "Cancel"}
                </Button>
              </Col>
            )}
            {IssueDetails.ticket_closable && (
              <Col>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => handleOpenModal('close', 'close')}
                >
                  Close Ticket
                </Button>
              </Col>
            )}
          </>
        )}
      </Row>

      {/* Selection inputs */}
      
      {inputForFetchingRole && IssueDetails.issue_status == TextConstants.Pending && (
        <Row justify="center" style={{ marginTop: 16 }}>
          <Col span={20}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select role to reassign"
                  value={selectedRoleId}
                  onChange={handlefetchUserDataByRole}
                >
                  {roles?.map((role) => (
                    role.position_id !== UserRoleConstants.eventOrganizerRoleId && (
                      <Option key={role.position_id} value={role.position_id}>
                        {role.position_id === currentUser.role_id ? "Team" : role.name}
                      </Option>
                    )
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select user"
                  value={selectedUserId}
                  onChange={handleUserSelect}
                >
                  {list?.map((user) => (
                    currentUser.id !== user.id && (
                      <Option key={user.id} value={user.id}>
                        {user.email}
                      </Option>
                    )
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      {/* Comments Card */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <CommentOutlined />
            <Title level={4} style={{ margin: 0 }}>Comments</Title>
          </Space>
          {renderCommentList()}
        </Space>
      </Card>

      {/* Comment Modal */}
      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={modalPurpose === 'reassign' ? handleSubmitComment : handleCloseTicket}
        onCancel={handleCloseModal}
        loading={false}
        comment={comment}
        setComment={setComment}
        title={modalPurpose === 'reassign' ? 'Reassignment Comment' : 'Closing Comment'}
        warningMessage={
          modalPurpose === 'reassign'
            ? 'Please provide a reason for reassigning the ticket.'
            : 'Close the ticket with comment'
        }
        showFileUpload={modalPurpose === 'reassign'}
        onFileChange={(files) => setUploadingFiles(files)}
      />

      <style jsx>{`
        .assignment-card {
          flex: 1;
          background: #fafafa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default IssueDetails;