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
  Input
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLeadEventDetails, EnrollUser } from "store/slices/leadEventSlice";
import Loading from "components/shared-components/Loading";
import ChatSection from "./ChatSection";
import { EditOutlined, UserAddOutlined, SwapOutlined } from "@ant-design/icons";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";

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
  const [form] = Form.useForm()

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

  // const handleEnrollSubmit = () => {
  //   message.success("User enrollment successful!");
  //   setEnrollModalVisible(false);
  // };
  const handleEnrollSubmit = async () => {
    try {
      const values = await form.validateFields(); 
      const data = {
        event_id: eventId, 
        email: values.email,
      };
  
      const response = await dispatch(EnrollUser(data)).unwrap(); 
      message.success(response.status?.message || "User enrolled successfully!"); 
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

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!eventDetails) return <div>No Event Details Found</div>;

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
              {/* Hide Enroll User button if user is Event Organizer */}
              {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
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
              {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
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
          {" "}
          <Title level={2} style={{ margin: "10px 0" }}>
            {eventDetails.event_name}
          </Title>
          <Text>{eventDetails.description}</Text>
        </Card>
      </Col>

      <Row gutter={[16, 16]} style={{ width: "100%" }}>
        <Col xs={24} lg={16}>
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
            <Card
              title={<span style={{ color: "#1890ff" }}>Event Users</span>}
              bordered={false}
              extra={
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  onClick={handleEnrollUser}
                  style={{ marginBottom: "10px" }}
                >
                  Add User
                </Button>
              }
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
            </Card>
          </Col>

          {/* Event Offers Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Collapse defaultActiveKey={["1"]}>
              <Panel header="Event Offers" key="1">
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
              <Panel header="Event Coupons" key="1">
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
          <Collapse defaultActiveKey={["1"]}>
            <Panel header="Media Gallery" key="1">
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
        </Col>

        <Col xs={24} lg={8}>
          <ChatSection eventId={eventId} getCurrentUser={getCurrentUser} />
        </Col>
      </Row>

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
          "@media (min-width: 992px)": {
            display: "none",
          },
        }}
        className="lg:hidden"
      >
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
