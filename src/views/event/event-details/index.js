import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Space, Image, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchEventDetails } from "store/slices/eventSlice";
import Loading from "components/shared-components/Loading";

const { Title, Text } = Typography;

const EventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const { eventDetails, loading, error } = useSelector((state) => state.event);

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
            <Image
              alt="event image"
              src="https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?cs=srgb&dl=pexels-wolfgang-1002140-2747449.jpg&fm=jpg"
              height={300}
              style={{ objectFit: "cover" }}
            />
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
              <Text strong>Venue:</Text> {eventDetails.venue.name}
            </Col>
            <Col span={12}>
              <Text strong>Available Seats:</Text> {eventDetails.max_tickets}
            </Col>
            <Col span={12}>
              <Text strong>Category:</Text> {eventDetails.category.name}
            </Col>
            <Col span={12}>
              <Text strong>Sub Category:</Text> {eventDetails.sub_category.name}
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Event Offers" bordered={false}>
          <Row gutter={[16, 16]}>
            {eventDetails.event_offers.map((offer, index) => (
              <Col xs={24} sm={12} md={8} lg={10} key={index}>
                <Card hoverable style={{backgroundColor:"#F1FAEC"}}>
                  <h2 style={{ color: "darkred" }}>{offer.offer.name}</h2>
                  <Row justify={"space-between"}>
                    <Text>{offer.offer.discount_percentage}% Discount</Text>
                    <Text>Max Users: {offer.offer.max_uses}</Text>
                  </Row>
                  <Row justify={"space-between"}>
                    <Text>Valid From: {offer.offer.start_date}</Text>
                    <Text>Valid To: {offer.offer.end_date}</Text>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      
      <Col span={24}>
        <Card title="Event Coupon" bordered={false} >
          <Row gutter={[16, 16]}>
            {eventDetails.event_coupons.map((coupon, index) => (
              <Col xs={24} sm={12} md={8} lg={10} key={index}>
                <Card hoverable style={{backgroundColor:"#F6FFFF"}}>
                  <h2 style={{ color: "darkred" }}>{coupon.coupons.name}</h2>
                  <Row justify={"space-between"}>
                    <Text>{coupon.coupons.discount_percentage}% Discount</Text>
                    <Text>Max Users: {coupon.coupons.max_uses}</Text>
                  </Row>
                  <Row justify={"space-between"}>
                    <Text>Valid From: {coupon.coupons.start_date}</Text>
                    <Text>Valid To: {coupon.coupons.end_date}</Text>
                  </Row>
                </Card>
              </Col>
            ))}
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
