import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Space, Image, Button, Carousel, Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLeadEventDetails } from "store/slices/leadEventSlice";
import Loading from "components/shared-components/Loading";
import ChatSection from "./ChatSection";
import { EditOutlined, UserAddOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventDetails, loading, error } = useSelector((state) => state.leadEvents);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  
  const mediaImages = eventDetails?.media?.map((item) => item.media_url) || [];
  

  const isNoImage =
    !eventDetails?.thumbnail_image ||
    eventDetails?.thumbnail_image === "images" ||
    eventDetails?.thumbnail_image === "";

  useEffect(() => {

    if (eventId) {
      dispatch(fetchLeadEventDetails(eventId));
    }
  }, [dispatch, eventId]);

  const handleEditEvent = () => {
 
    navigate(`/events/edit/${eventId}`);
  };

  const handleEnrollUser = () => {

    setEnrollModalVisible(true);
  };

  const handleEnrollSubmit = () => {
  
    message.success("User enrollment successful!");
    setEnrollModalVisible(false);
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
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={handleEnrollUser}
              >
                Enroll User
              </Button>
              <Button 
                type="default" 
                icon={<EditOutlined />} 
                onClick={handleEditEvent}
              >
                Edit Event
              </Button>
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
                      {index < eventDetails.lead_venue_events.length - 1 ? ", " : ""}
                    </span>
                  )) || "N/A"}
                </Col>
                <Col span={12}>
                  <Text strong>Available Seats:</Text> {eventDetails.max_tickets}
                </Col>
                <Col span={12}>
                  <Text strong>Category:</Text> {eventDetails.category?.name ?? "N/A"}
                </Col>
                <Col span={12}>
                  <Text strong>Sub Category:</Text> {eventDetails.sub_category?.name ?? "N/A"}
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
                      <Card hoverable style={{ textAlign: "center", borderRadius: 10, boxShadow: "0 4px 8px rgba(0,0,0,0.1)", padding: 15 }}>
                        <div>
                          {user.thumbnail_image ? (
                            <Image
                              alt="User Thumbnail"
                              src={user.thumbnail_image}
                              height={100}
                              width={100}
                              style={{ objectFit: "cover", borderRadius: "50%", marginBottom: 10 }}
                            />
                          ) : (
                            <div style={{ height: 100, width: 100, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0", color: "#888", borderRadius: "50%", margin: "0 auto 10px" }}>No Image</div>
                          )}
                          <Title level={5} style={{ marginBottom: 5 }}>{user.username}</Title>
                          <Text type="secondary">{user.role?.name || "N/A"}</Text>
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
            <Card title="Event Offers" bordered={false}>
              <Row gutter={[16, 16]}>
                {eventDetails.event_offers && eventDetails.event_offers.length > 0 ? (
                  eventDetails.event_offers.map((offer, index) => (
                    <Col xs={24} sm={12} md={12} key={index}>
                      <Card hoverable style={{ backgroundColor: "#F1FAEC" }}>
                        <h2 style={{ color: "darkred" }}>{offer.offer.name}</h2>
                        <Row justify={"space-between"}>
                          <Text>{offer.offer.discount_percentage}% Discount</Text>
                          <Text>Max Users: {offer.offer.max_uses}</Text>
                        </Row>
                        <Row justify={"space-between"}>
                          <Text>Valid From: {offer.offer.start_date}</Text>
                          <Text>Valid To: {offer.offer.end_date}</Text>
                        </Row>
                        <div style={{ marginTop: "10px" }}>
                          {offer.offer.thumbnail_image !== "images" && offer.offer.thumbnail_image ? (
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
            </Card>
          </Col>

          {/* Event Coupon Section */}
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Card title="Event Coupon" bordered={false}>
              <Row gutter={[16, 16]}>
                {eventDetails.event_coupons && eventDetails.event_coupons.length > 0 ? (
                  eventDetails.event_coupons.map((coupon, index) => (
                    <Col xs={24} sm={12} md={12} key={index}>
                      <Card hoverable style={{ backgroundColor: "#F6FFFF" }}>
                        <h2 style={{ color: "darkred" }}>{coupon.coupons.name}</h2>
                        <Row justify={"space-between"}>
                          <Text>{coupon.coupons.discount_percentage}% Discount</Text>
                          <Text>Max Users: {coupon.coupons.max_uses}</Text>
                        </Row>
                        <Row justify={"space-between"}>
                          <Text>Valid From: {coupon.coupons.start_date}</Text>
                          <Text>Valid To: {coupon.coupons.end_date}</Text>
                        </Row>
                        <div style={{ marginTop: "10px" }}>
                          {coupon.coupons.thumbnail_image !== "images" && coupon.coupons.thumbnail_image ? (
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
            </Card>
          </Col>

          {/* Media Gallery Section */}
          {mediaImages.length > 0 && (
            <Col span={24} style={{ marginBottom: "16px" }}>
              <Card
                title={<span style={{ color: "#1890ff" }}>Media Gallery</span>}
                bordered={false}
              >
                <Carousel autoplay>
                  {mediaImages.map((url, index) => (
                    <div key={index}>
                      <Image alt={`media image ${index + 1}`} src={url} height={300} />
                    </div>
                  ))}
                </Carousel>
              </Card>
            </Col>
          )}
        </Col>

 
        <Col xs={24} lg={8}>
          <ChatSection eventId={eventId} />
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
            display: "none"
          }
        }}
        className="lg:hidden"
      >
        <Button 
          type="primary" 
          shape="circle" 
          size="large" 
          icon={<UserAddOutlined />} 
          onClick={handleEnrollUser}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        />
        <Button 
          type="default" 
          shape="circle" 
          size="large" 
          icon={<EditOutlined />} 
          onClick={handleEditEvent}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
        />
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
        {/* Here you would add your enrollment form */}
        <p>Select users to enroll in this event.</p>
        {/* You could add user selection components here */}
      </Modal>
    </Row>
  );
};

export default EventDetails;