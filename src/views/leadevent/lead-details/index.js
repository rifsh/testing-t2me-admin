import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Avatar,
  Divider,
  Space,
  Alert,
  Form,
  Modal,
  message,
  Radio
} from "antd";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getSingleLeadEvents } from "store/slices/leadEventSlice";
import Loading from "components/shared-components/Loading";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TeamOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UndoOutlined,
  RightOutlined
} from "@ant-design/icons";
import { LeadStatus } from "store/slices/leadEventSlice";

const { Title, Text } = Typography;

// Helper function for status display
const getStatusTag = (status) => {
  let color = "orange";
  let displayText = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";

  if (status === "approved") {
    color = "green";
    displayText = "Converted";
  } else if (status === "rejected") {
    color = "red";
  }

  return <Tag color={color}>{displayText}</Tag>;
};

const SingleEventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reactivateModalVisible, setReactivateModalVisible] = useState(false);
  const [moduleSelectionModalVisible, setModuleSelectionModalVisible] = useState(false);
  const [selectedModuleType, setSelectedModuleType] = useState('events');

  const { singleLeadEvent, loading, error } = useSelector(
    (state) => state.leadEvents
  );
  
  const handleViewDetails = async (id) => {
    await dispatch(getSingleLeadEvents(id));
    navigate(`${APP_PREFIX_PATH}/leadevent/add/${id}`);
  };
  
  const handleRejectRequest = () => {
    setRejectModalVisible(true);
  };

  const handleReactivateRequest = () => {
    setReactivateModalVisible(true);
  };
  
  const handleRejectSubmit = async () => {
    try {
      const data = {
        event_id: eventId,
        status: "REJECTED" 
      };

      const response = await dispatch(LeadStatus(data)).unwrap();
      message.success(
        response.status?.message || "Request rejected successfully!"
      );
      setRejectModalVisible(false);
      // Refresh the event data
      dispatch(getSingleLeadEvents(eventId));
    } catch (error) {
      console.error("Rejection failed:", error);
      message.error("Failed to reject the request. Please try again.");
    }
  };

  const handleReactivateSubmit = async () => {
    try {
      const data = {
        event_id: eventId,
        status: "PENDING" 
      };

      const response = await dispatch(LeadStatus(data)).unwrap();
      message.success(
        response.status?.message || "Request reactivated successfully!"
      );
      setReactivateModalVisible(false);
      // Refresh the event data
      dispatch(getSingleLeadEvents(eventId));
    } catch (error) {
      console.error("Reactivation failed:", error);
      message.error("Failed to reactivate the request. Please try again.");
    }
  };
  
  const handleOpenModuleSelectionModal = () => {
    setModuleSelectionModalVisible(true);
  };

  const handleModuleSelectionChange = (e) => {
    setSelectedModuleType(e.target.value);
  };

  const handleModuleSelectionSubmit = () => {
    setModuleSelectionModalVisible(false);
    

    if (selectedModuleType === 'events') {

      handleViewDetails(singleLeadEvent.id);
    } else if (selectedModuleType === 'movies') {
 
      message.info("The Movies module is under development and will be available soon.");
      
    } else if (selectedModuleType === 'dineIn') {

      message.info("The Dine-In module is currently in progress and will be launched soon.");

    }
  };
  
  useEffect(() => {
    if (eventId && !singleLeadEvent) {
      dispatch(getSingleLeadEvents(eventId));
    }
  }, [dispatch, eventId, singleLeadEvent]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Title level={4} type="danger">
          Error: {error}
        </Title>
      </div>
    );
  if (!singleLeadEvent)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Title level={4}>No Event Details Found</Title>
      </div>
    );

  const moduleTypeOptions = [
    { label: 'Events', value: 'events' },
    { label: 'Movies', value: 'movies' },
    { label: 'Dine In', value: 'dineIn' }
  ];

  return (
    <>
      <Row gutter={[24, 24]} style={{ padding: 24 }}>
        {/* Event Details */}
        <Col span={24}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#1890ff",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  <CalendarOutlined /> Event Details
                </span>
                {getStatusTag(singleLeadEvent.approval_status)}
              </div>
            }
            bordered={false}
            className="event-card"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          >
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                  {singleLeadEvent.event_name || "N/A"}
                </Title>
              </Col>

              <Col span={24}>
                <Text type="secondary">Description</Text>
                <div style={{ marginTop: 4, marginBottom: 16 }}>
                  {singleLeadEvent.description || "No description available"}
                </div>
              </Col>

              <Divider style={{ margin: "8px 0 16px" }} />

              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <EnvironmentOutlined
                    style={{ marginRight: 8, marginTop: 4, color: "#1890ff" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: 2 }}>
                      Venue
                    </div>
                    <div>{singleLeadEvent?.venue_name || "Not specified"}</div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <TeamOutlined
                    style={{ marginRight: 8, marginTop: 4, color: "#1890ff" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: 2 }}>
                      Organizer
                    </div>
                    <div>
                      {singleLeadEvent.organizer_name || "Not specified"}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <CalendarOutlined
                    style={{ marginRight: 8, marginTop: 4, color: "#1890ff" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: 2 }}>
                      Date
                    </div>
                    <div>
                      {singleLeadEvent.start_date
                        ? `${singleLeadEvent.start_date} to ${singleLeadEvent.end_date}`
                        : "Not specified"}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <GlobalOutlined
                    style={{ marginRight: 8, marginTop: 4, color: "#1890ff" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: 2 }}>
                      Location
                    </div>
                    <div>{singleLeadEvent?.place_name || "Not specified"}</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={
              <span
                style={{
                  color: "#1890ff",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                <UserOutlined /> Event Admin
              </span>
            }
            bordered={false}
            className="admin-card"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          >
            <Row gutter={[24, 24]}>
              {singleLeadEvent.customer ? (
                <Col xs={24} sm={24} md={8}>
                  <Card
                    hoverable
                    style={{
                      textAlign: "center",
                      borderRadius: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      size={80}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: "#1890ff",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {singleLeadEvent.customer.username}
                    </Title>
                    <Text type="secondary">Event Administrator</Text>
                  </Card>
                </Col>
              ) : (
                <Col span={24} style={{ textAlign: "center" }}>
                  <Text>No administrator associated with this event</Text>
                </Col>
              )}

              <Col xs={24} md={16}>
                <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
                  Contact Information
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <MailOutlined
                        style={{
                          fontSize: 16,
                          color: "#1890ff",
                          marginRight: 8,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: 2 }}>
                          Email
                        </div>
                        <div style={{ wordBreak: "break-word" }}>
                          {singleLeadEvent.email || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <PhoneOutlined
                        style={{
                          fontSize: 16,
                          color: "#1890ff",
                          marginRight: 8,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: 2 }}>
                          Phone
                        </div>
                        <div>
                          {singleLeadEvent.phone_number || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col
          span={24}
          style={{ textAlign: "center", marginTop: 20, marginBottom: 10 }}
        >
          {singleLeadEvent.approval_status === "approved" ? (
            <Alert
              message="This event has already been converted."
              type="success"
              showIcon
              style={{
                fontSize: 16,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 8,
                maxWidth: 400,
                margin: "0 auto",
              }}
            />
          ) : singleLeadEvent.approval_status === "rejected" ? (
            <>
              <Alert
                message="This event request has been rejected."
                type="error"
                showIcon
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "12px 24px",
                  borderRadius: 8,
                  maxWidth: 400,
                  margin: "0 auto 20px auto",
                }}
              />
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<UndoOutlined />}
                onClick={handleReactivateRequest}
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 16,
                  boxShadow: "0 2px 6px rgba(24, 144, 255, 0.4)",
                }}
              >
                Reactivate
              </Button>
            </>
          ) : (
            <Space size={16}>
              <Button
                onClick={handleOpenModuleSelectionModal}
                type="primary"
                size="large"
                shape="round"
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 16,
                  boxShadow: "0 2px 6px rgba(24, 144, 255, 0.4)",
                }}
              >
                Proceed
              </Button>

              <Button
                type="primary"
                danger
                size="large"
                shape="round"
                icon={<CloseCircleOutlined />}
                onClick={handleRejectRequest}
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 16,
                  boxShadow: "0 2px 6px rgba(255, 77, 79, 0.4)",
                }}
              >
                Reject
              </Button>
            </Space>
          )}
        </Col>
        
        {/* Reject Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "20px", marginRight: "10px" }} />
              <span>Confirm Rejection</span>
            </div>
          }
          open={rejectModalVisible}
          onCancel={() => setRejectModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setRejectModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" danger onClick={handleRejectSubmit}>
              Yes, Reject
            </Button>,
          ]}
        >
          <Alert
            message="Warning"
            description="Do you really want to reject this request?"
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        </Modal>
        
        {/* Reactivate Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <UndoOutlined style={{ color: "#1890ff", fontSize: "20px", marginRight: "10px" }} />
              <span>Confirm Reactivation</span>
            </div>
          }
          open={reactivateModalVisible}
          onCancel={() => setReactivateModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setReactivateModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleReactivateSubmit}>
              Yes, Reactivate
            </Button>,
          ]}
        >
          <Alert
            message="Reactivation Notice"
            description="You are about to reactivate this previously rejected event request. This will change its status back to pending and make it available for processing. Are you sure you want to continue?"
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        </Modal>
        
        {/* Module Type Selection Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Select  Type
              </span>
            </div>
          }
          open={moduleSelectionModalVisible}
          onCancel={() => setModuleSelectionModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModuleSelectionModalVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleModuleSelectionSubmit}
              icon={<RightOutlined />}
            >
              Next
            </Button>,
          ]}
        >
          <div style={{ padding: "16px 0" }}>
            <Radio.Group 
              value={selectedModuleType}
              onChange={handleModuleSelectionChange}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {moduleTypeOptions.map(option => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    style={{
                      width: "100%",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "20px",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxShadow: selectedModuleType === option.value ? "0 2px 8px rgba(24, 144, 255, 0.2)" : "none",
                      border: selectedModuleType === option.value ? "2px solid #1890ff" : "1px solid #d9d9d9"
                    }}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </div>
        </Modal>
      </Row>
    </>
  );
};

export default SingleEventDetails;