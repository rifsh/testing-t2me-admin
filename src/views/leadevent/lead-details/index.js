import React, { useEffect } from "react";
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
} from "@ant-design/icons";

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

  const { singleLeadEvent, loading, error } = useSelector(
    (state) => state.leadEvents
  );
  const handleViewDetails = async (id) => {
    await dispatch(getSingleLeadEvents(id));
    navigate(`${APP_PREFIX_PATH}/leadevent/add/${id}`);
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

  return (
    <>
      <Row gutter={[24, 24]} style={{ padding: 24 }}>
        {/* Event Details */}
        <Col span={24}>
          {/* <EventDetails event={singleLeadEvent} /> */}
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
                    <div>
                      {singleLeadEvent.venues?.length > 0
                        ? singleLeadEvent.venues.map((venue, index) => (
                            <span key={index}>
                              {venue.name}
                              {index < singleLeadEvent.venues.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))
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
                    <div>
                    {singleLeadEvent?.place_name || "Not specified"}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          {/* <EventAdmin
          admin={singleLeadEvent.customer}
          contact={singleLeadEvent}
        /> */}
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
          <Space size={16}>
            <Button
            onClick={() => handleViewDetails(singleLeadEvent.id)}
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
              Convert
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              shape="round"
              icon={<CloseCircleOutlined />}
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
        </Col>
      </Row>
    </>
  );
};

export default SingleEventDetails;
