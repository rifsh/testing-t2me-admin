import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Image,
  Button,
  Carousel,
  Modal,
  message,
  Collapse,
  Form,
  Input,
  Popover,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLeadEventDetails, EnrollUser } from "store/slices/leadEventSlice";
import Loading from "components/shared-components/Loading";
import ChatSection from "./ChatSection";
import {
  EditOutlined,
  UserAddOutlined,
  SwapOutlined,
  LeftOutlined,
  RightOutlined,
  MessageOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import thumb from "../../../assets/preview/thumnail image.png";
import banner from "../../../assets/preview/banner image.png";

const { Title, Text } = Typography;
const { Panel } = Collapse;
export const getUserRole = () => {
  const currentUser = getCurrentUser();
  switch (currentUser.role_id) {
    case UserRoleConstants.superAdminRoleId:
      return UserRoleConstants.superAdmin;
    case UserRoleConstants.eventSupportingTeamRoleId:
      return UserRoleConstants.eventSupportingTeam;
  }
};

const EventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventDetails, loading, error } = useSelector(
    (state) => state.leadEvents
  );
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);

  // Handle responsive behavior
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse chat on mobile
      if (window.innerWidth < 768 && !chatCollapsed) {
        setChatCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chatCollapsed]);

  const mediaImages = eventDetails?.media?.map((item) => item.media_url) || [];
  const currentUser = getCurrentUser();

  const isNoImage =
    !eventDetails?.thumbnail_image ||
    eventDetails?.thumbnail_image === "images" ||
    eventDetails?.thumbnail_image === "";

  useEffect(() => {
    if (eventId) {
      dispatch(fetchLeadEventDetails(eventId));
    }
  }, [dispatch, eventId]);

  const handleEditEvent = async (id) => {
    await dispatch(fetchLeadEventDetails(id));
    navigate(`${APP_PREFIX_PATH}/leadevent/edit/${id}`);
  };

  const handleEnrollUser = () => {
    setEnrollModalVisible(true);
  };

  const handleEnrollSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        event_id: eventId,
        email: values.email,
      };

      const response = await dispatch(EnrollUser(data)).unwrap();
      message.success(
        response.status?.message || "User enrolled successfully!"
      );
      setEnrollModalVisible(false);
      form.resetFields();

      dispatch(fetchLeadEventDetails(eventId));
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };
  const handleConvertEvent = () => {
    setConvertModalVisible(true);
  };

  const handleConfirmConvert = () => {
    // TODO: Implement actual conversion logic
    message.success("Event conversion initiated!");
    setConvertModalVisible(false);
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setChatCollapsed(!chatCollapsed);
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!eventDetails) return <div>No Event Details Found</div>;

  // Calculate column spans based on chat visibility
  const mainColSpan = chatCollapsed ? 24 : windowWidth >= 992 ? 16 : 24;
  const chatColSpan = chatCollapsed ? 0 : windowWidth >= 992 ? 8 : 24;

  // Preview content for different sections
  const previewContent = {
    eventUsers: (
      <Card style={{ width: 300 }}>
        <div style={{ textAlign: "center" }}>
          <Image
            src="https://randomuser.me/api/portraits/women/44.jpg"
            width={100}
            height={100}
            style={{ borderRadius: "50%" }}
          />
          <Title level={5} style={{ marginTop: 10 }}>
            Jane Doe
          </Title>
          <Text type="secondary">Attendee</Text>
        </div>
      </Card>
    ),
    eventOffers: (
      <Card style={{ width: 300, backgroundColor: "#F1FAEC" }}>
        <Title level={4} style={{ color: "darkred" }}>
          Summer Special
        </Title>
        <Text>20% Discount</Text>
        <br />
        <Text>Valid until: 2023-12-31</Text>
      </Card>
    ),
    eventCoupons: (
      <Card style={{ width: 300, backgroundColor: "#F6FFFF" }}>
        <Title level={4} style={{ color: "darkred" }}>
          Early Bird
        </Title>
        <Text>15% Discount</Text>
        <br />
        <Text>Valid until: 2023-11-30</Text>
      </Card>
    ),
    mediaGallery: (
      <div style={{ width: 300 }}>
        <Image src={banner} width={300} height={200} />
        <Text>Event photo preview</Text>
      </div>
    ),
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          bordered={false}
          cover={
            isNoImage ? (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  color: "#888",
                }}
              >
                No Image
              </div>
            ) : (
              <Image
                alt="place thumbnail"
                src={eventDetails.thumbnail_image}
                height={300}
                style={{ objectFit: "cover" }}
              />
            )
          }
          extra={
            <Space style={{ marginBottom: "15px" }}>
              {/* Preview button with Modal for full image */}
              <Modal
                title="Event Preview"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="50%"
                bodyStyle={{
                  padding: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                style={{ maxWidth: "90vw" }}
              >
                <div
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    overflow: "auto",
                  }}
                >
                  <img
                    src={thumb}
                    alt="Event Preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              </Modal>
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
              >
                Preview
              </Button>

              {/* Chat toggle button */}
              <Button
                type="default"
                icon={chatCollapsed ? <MessageOutlined /> : <RightOutlined />}
                onClick={toggleChat}
              >
                {chatCollapsed ? "Show Chat" : "Hide Chat"}
              </Button>

              {/* Hide Enroll User button if user is Event Organizer */}
              {currentUser.role_id !==
                UserRoleConstants.eventOrganizerRoleId && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleEnrollUser}
                >
                  Enroll User
                </Button>
              )}

              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => handleEditEvent(eventDetails.id)}
              >
                Edit Event
              </Button>

              {/* Hide Convert button if user is Event Organizer */}
              {currentUser.role_id !==
                UserRoleConstants.eventOrganizerRoleId && (
                <Button
                  type="primary"
                  danger
                  icon={<SwapOutlined />}
                  onClick={handleConvertEvent}
                  style={{
                    backgroundColor: "#ff4d4f",
                    borderColor: "#ff4d4f",
                    fontWeight: "bold",
                  }}
                >
                  Convert
                </Button>
              )}
            </Space>
          }
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {eventDetails.event_name}
          </Title>
          <Text>{eventDetails.description}</Text>
        </Card>
      </Col>

      <Row gutter={[16, 16]} style={{ width: "100%" }}>
        {/* Main Content */}
        <Col xs={24} lg={mainColSpan} style={{ transition: "all 0.3s ease" }}>
          {/* Event Overview Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Card
              title={<span style={{ color: "#1890ff" }}>Event Overview</span>}
              bordered={false}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Venue:</Text>{" "}
                  {eventDetails.lead_venue_events?.map((venueEvent, index) => (
                    <span key={index}>
                      {venueEvent.lead_venue.name}
                      {index < eventDetails.lead_venue_events.length - 1
                        ? ", "
                        : ""}
                    </span>
                  )) || "N/A"}
                </Col>
                <Col span={12}>
                  <Text strong>Available Seats:</Text>{" "}
                  {eventDetails.max_tickets}
                </Col>
                <Col span={12}>
                  <Text strong>Category:</Text>{" "}
                  {eventDetails.category?.name ?? "N/A"}
                </Col>
                <Col span={12}>
                  <Text strong>Sub Category:</Text>{" "}
                  {eventDetails.sub_category?.name ?? "N/A"}
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Event Users Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Collapse defaultActiveKey={["1"]}>
              <Panel
                header={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Event Users</span>
                    <Popover
                      content={previewContent.eventUsers}
                      title="Preview"
                      trigger="hover"
                    >
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        style={{ marginLeft: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popover>
                  </div>
                }
                key="1"
              >
                <Row gutter={[24, 24]} justify="center">
                  {eventDetails.users && eventDetails.users.length > 0 ? (
                    eventDetails.users.map((user, index) => (
                      <Col xs={24} sm={12} md={8} lg={8} key={index}>
                        <Card
                          hoverable
                          style={{
                            textAlign: "center",
                            borderRadius: 10,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            padding: 15,
                          }}
                        >
                          <div>
                            {user.thumbnail_image ? (
                              <Image
                                alt="User Thumbnail"
                                src={user.thumbnail_image}
                                height={100}
                                width={100}
                                style={{
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                  marginBottom: 10,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  height: 100,
                                  width: 100,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f0f0f0",
                                  color: "#888",
                                  borderRadius: "50%",
                                  margin: "0 auto 10px",
                                }}
                              >
                                No Image
                              </div>
                            )}
                            <Title level={5} style={{ marginBottom: 5 }}>
                              {user.username}
                            </Title>
                            <Text type="secondary">
                              {user.role?.name || "N/A"}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Text>No Users Associated</Text>
                    </Col>
                  )}
                </Row>
                {/* Add User Button */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleEnrollUser}
                  >
                    Add User
                  </Button>
                </div>
              </Panel>
            </Collapse>
          </Col>

          {/* Event Offers Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Collapse defaultActiveKey={["1"]}>
              <Panel
                header={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Event Offers</span>
                    <Popover
                      content={previewContent.eventOffers}
                      title="Preview"
                      trigger="hover"
                    >
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        style={{ marginLeft: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popover>
                  </div>
                }
                key="1"
              >
                <Row gutter={[16, 16]}>
                  {eventDetails.event_offers &&
                  eventDetails.event_offers.length > 0 ? (
                    eventDetails.event_offers.map((offer, index) => (
                      <Col xs={24} sm={12} md={12} key={index}>
                        <Card hoverable style={{ backgroundColor: "#F1FAEC" }}>
                          <h2 style={{ color: "darkred" }}>
                            {offer.offer.name}
                          </h2>
                          <Row justify={"space-between"}>
                            <Text>
                              {offer.offer.discount_percentage}% Discount
                            </Text>
                            <Text>Max Users: {offer.offer.max_uses}</Text>
                          </Row>
                          <Row justify={"space-between"}>
                            <Text>Valid From: {offer.offer.start_date}</Text>
                            <Text>Valid To: {offer.offer.end_date}</Text>
                          </Row>
                          <div style={{ marginTop: "10px" }}>
                            {offer.offer.thumbnail_image !== "images" &&
                            offer.offer.thumbnail_image ? (
                              <Image
                                alt="offer thumbnail"
                                src={offer.offer.thumbnail_image}
                                height={100}
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                style={{
                                  height: 100,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f0f0f0",
                                  color: "#888",
                                }}
                              >
                                No Image
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Text>No Offers Available</Text>
                    </Col>
                  )}
                </Row>
              </Panel>
            </Collapse>
          </Col>

          {/* Event Coupon Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Collapse defaultActiveKey={["1"]}>
              <Panel
                header={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Event Coupons</span>
                    <Popover
                      content={previewContent.eventCoupons}
                      title="Preview"
                      trigger="hover"
                    >
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        style={{ marginLeft: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popover>
                  </div>
                }
                key="1"
              >
                <Row gutter={[16, 16]}>
                  {eventDetails.event_coupons &&
                  eventDetails.event_coupons.length > 0 ? (
                    eventDetails.event_coupons.map((coupon, index) => (
                      <Col xs={24} sm={12} md={12} key={index}>
                        <Card hoverable style={{ backgroundColor: "#F6FFFF" }}>
                          <h2 style={{ color: "darkred" }}>
                            {coupon.coupons.name}
                          </h2>
                          <Row justify={"space-between"}>
                            <Text>
                              {coupon.coupons.discount_percentage}% Discount
                            </Text>
                            <Text>Max Users: {coupon.coupons.max_uses}</Text>
                          </Row>
                          <Row justify={"space-between"}>
                            <Text>Valid From: {coupon.coupons.start_date}</Text>
                            <Text>Valid To: {coupon.coupons.end_date}</Text>
                          </Row>
                          <div style={{ marginTop: "10px" }}>
                            {coupon.coupons.thumbnail_image !== "images" &&
                            coupon.coupons.thumbnail_image ? (
                              <Image
                                alt="coupon thumbnail"
                                src={coupon.coupons.thumbnail_image}
                                height={100}
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                style={{
                                  height: 100,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f0f0f0",
                                  color: "#888",
                                }}
                              >
                                No Image
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Text>No Coupons Available</Text>
                    </Col>
                  )}
                </Row>
              </Panel>
            </Collapse>
          </Col>

          {/* Media Gallery Section */}
          {/* Media Gallery Section */}
          <Collapse defaultActiveKey={["1"]}>
            <Panel
              header={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>Media Gallery</span>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ marginLeft: "auto" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewVisible(true);
                    }}
                  />
                </div>
              }
              key="1"
            >
              {mediaImages.length > 0 && (
                <Col span={24} style={{ marginBottom: "16px" }}>
                  <Card
                    title={
                      <span style={{ color: "#1890ff" }}>Media Gallery</span>
                    }
                    bordered={false}
                  >
                    <Carousel autoplay>
                      {mediaImages.map((url, index) => (
                        <div key={index}>
                          <Image
                            alt={`media image ${index + 1}`}
                            src={url}
                            height={300}
                          />
                        </div>
                      ))}
                    </Carousel>
                  </Card>
                </Col>
              )}
            </Panel>
          </Collapse>

          {/* Media Preview Modal */}
          <Modal
            title="Media Gallery Preview"
            open={previewVisible}
            onCancel={() => setPreviewVisible(false)}
            footer={null}
            width="auto"
            bodyStyle={{
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ maxWidth: "90vw" }}
          >
            <div
              style={{ maxWidth: "100%", maxHeight: "80vh", overflow: "auto" }}
            >
              <img
                src={banner}
                alt="Media Gallery Preview"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          </Modal>
        </Col>

        {/* Chat Section */}
        {!chatCollapsed && (
          <Col
            xs={24}
            lg={chatColSpan}
            style={{
              transition: "all 0.3s ease",
              position: windowWidth >= 992 ? "relative" : "fixed",
              top: windowWidth >= 992 ? "auto" : "50px",
              right: windowWidth >= 992 ? "auto" : "0",
              bottom: windowWidth >= 992 ? "auto" : "0",
              width: windowWidth >= 992 ? "auto" : "80%",
              height: windowWidth >= 992 ? "auto" : "calc(100vh - 50px)",
              zIndex: windowWidth >= 992 ? "auto" : "1000",
              backgroundColor: windowWidth >= 992 ? "transparent" : "#f9f9f9",
              boxShadow:
                windowWidth >= 992 ? "none" : "-2px 0 10px rgba(0,0,0,0.1)",
              padding: windowWidth >= 992 ? "0" : "10px",
            }}
          >
            <div style={{ position: "relative" }}>
              <ChatSection
                eventId={eventId}
                getCurrentUser={getCurrentUser}
                isCollapsed={chatCollapsed}
                onToggleCollapse={toggleChat}
              />
            </div>
          </Col>
        )}
      </Row>

      {/* Floating Action Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
        }}
        className="lg:hidden"
      >
        {/* Chat toggle button for mobile */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={toggleChat}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            backgroundColor: "#1890ff",
            display: chatCollapsed ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
          }}
        />

        {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<UserAddOutlined />}
            onClick={handleEnrollUser}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          />
        )}

        <Button
          type="default"
          shape="circle"
          size="large"
          icon={<EditOutlined />}
          onClick={() => handleEditEvent(eventDetails.id)}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
        />

        {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
          <Button
            type="primary"
            danger
            shape="circle"
            size="large"
            icon={<SwapOutlined />}
            onClick={handleConvertEvent}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
            }}
          />
        )}
      </div>

      {/* Enrollment Modal */}
      <Modal
        title="Enroll User to Event"
        open={enrollModalVisible}
        onCancel={() => setEnrollModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEnrollModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEnrollSubmit}>
            Enroll
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="User Email"
            rules={[
              { required: true, message: "Please enter the user's email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter user email" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert Confirmation Modal */}
      <Modal
        title={
          <div
            style={{
              color: "#ff4d4f",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Confirm Event Conversion
          </div>
        }
        open={convertModalVisible}
        onCancel={() => setConvertModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setConvertModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleConfirmConvert}
            style={{
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
            }}
          >
            Yes, Continue Conversion
          </Button>,
        ]}
      >
        <div
          style={{
            textAlign: "center",
            color: "#ff4d4f",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          Are you sure you want to convert this event?
        </div>
        <p style={{ textAlign: "center", color: "#666" }}>
          This action cannot be undone. Please confirm that you want to proceed
          with the conversion.
        </p>
      </Modal>
    </Row>
  );
};

export default EventDetails;
