import React, { useEffect } from "react";
import { Card, Row, Col, Typography, List, Divider, Space, Image, Button } from "antd";
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
      {/* Event Image Section with reduced height */}
      <Col span={24}>
        <Card
          bordered={false}
          cover={<Image alt="event image" src="https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?cs=srgb&dl=pexels-wolfgang-1002140-2747449.jpg&fm=jpg" height={250} />}
        >
          <Title level={2}>{eventDetails.event_name}</Title>
          <Text>{eventDetails.description}</Text>
        </Card>
      </Col>

      {/* Event Overview Section */}
      <Col span={24}>
        <Card title="Event Overview" bordered hoverable>
          <Row>
            <Col span={12}>
              <Text strong>Date: </Text>{eventDetails.event_date}
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text strong>Venue: </Text>{eventDetails.venue_id}
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Text strong>Category: </Text>{eventDetails.category_id}
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text strong>Available Seats: </Text>{eventDetails.max_tickets}
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Event Offers Section (No card for each offer, simple listing) */}
      <Col span={24}>
        <Card title="Event Offers" bordered hoverable>
          <List
            dataSource={eventDetails.event_offers}
            renderItem={(offer) => (
              <List.Item>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Offer Name: </Text>{offer.offer.name}
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong>Discount: </Text>{offer.offer.discount_percentage}%
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Valid From: </Text>{offer.valid_from}
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong>Valid To: </Text>{offer.valid_to}
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Max Uses: </Text>{offer.offer.max_uses}
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* Event Coupons Section (Simplified like Offers) */}
      <Col span={24}>
        <Card title="Event Coupons" bordered hoverable>
          <List
            dataSource={eventDetails.event_coupons}
            renderItem={(coupon) => (
              <List.Item>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Coupon Name: </Text>{coupon.coupons.name}
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong>Coupon Code: </Text>{coupon.coupons.coupon_code}
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Discount: </Text>{coupon.coupons.discount_percentage}%
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong>Valid From: </Text>{coupon.valid_from}
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Min Purchase: </Text>{coupon.coupons.min_purchase_amount}
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong>Valid To: </Text>{coupon.valid_to}
                  </Col>
                </Row>
                <Row style={{ width: '100%' }}>
                  <Col span={12}>
                    <Text strong>Max Uses: </Text>{coupon.coupons.max_uses}
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default EventDetails;
