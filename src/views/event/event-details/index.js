import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Space, Image, Button,Carousel } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchEventDetails } from "store/slices/eventSlice";
import Loading from "components/shared-components/Loading";

const { Title, Text } = Typography;

const EventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const { eventDetails, loading, error } = useSelector((state) => state.event);
  const mediaImages = eventDetails.media?.map((item) => item.media_url) || [];

  // Check if thumbnail image is missing or contains a default value
  const isNoImage =
    !eventDetails.thumbnail_image ||
    eventDetails.thumbnail_image === "images" ||
    eventDetails.thumbnail_image === "";

  useEffect(() => {
    if (eventId && !eventDetails) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, eventId, eventDetails]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!eventDetails) return <div>No Event Details Found</div>;

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      {/* Event Image Section */}
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
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {eventDetails.event_name}
          </Title>
          <Text>{eventDetails.description}</Text>
        </Card>
      </Col>

      {/* Event Overview Section */}
      <Col span={24}>
        <Card
          title={<span style={{ color: "#1890ff" }}>Event Overview</span>}
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Venue:</Text>{" "}
              {eventDetails.venue_events?.map((venueEvent, index) => (
                <span key={index}>
                  {venueEvent.venue.name}
                  {index < eventDetails.venue_events.length - 1 ? ", " : ""}
                </span>
              )) || "N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Available Seats:</Text> {eventDetails.max_tickets}
            </Col>
            <Col span={12}>
              <Text strong>Category:</Text> {eventDetails.category?.name??"N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Sub Category:</Text> {eventDetails.sub_category?.name??"N/A"}
            </Col>
          </Row>
        </Card>
      </Col>


      <Col span={24}>
        <Card title={<span style={{ color: "#1890ff" }}>Event Users</span>} bordered={false}>
          <Row gutter={[24, 24]} justify="center">
            {eventDetails.users?.length > 0 ? (
              eventDetails.users.map((user, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
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

      <Col span={24}>
        <Card title="Event Offers" bordered={false}>
          <Row gutter={[16, 16]}>
            {eventDetails.event_offers.map((offer, index) => (
              <Col xs={24} sm={12} md={8} lg={10} key={index}>
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
            ))}
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Event Coupon" bordered={false}>
          <Row gutter={[16, 16]}>
            {eventDetails.event_coupons.map((coupon, index) => (
              <Col xs={24} sm={12} md={8} lg={10} key={index}>
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
                  {/* Check if the coupon has a valid image */}
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
            ))}
            {mediaImages.length > 0 && (
        <Col span={24}>
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
          </Row>
        </Card>
      </Col>

      {/* Action Button Section */}
      <Col span={24} style={{ textAlign: "center", marginTop: "20px" }}>
        <Button type="primary" size="large">
          Register Now
        </Button>
      </Col>
    </Row>
  );
};

export default EventDetails;
