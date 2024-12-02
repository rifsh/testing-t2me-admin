import React, { useEffect } from "react";
import { Card, Row, Col, Typography, List, Tag, Divider, Space } from "antd";
import { ShoppingCartOutlined, TagOutlined, GiftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { fetchEventDetails } from "store/slices/eventSlice";
import { useSelector, useDispatch } from "react-redux";
import Loading from "components/shared-components/Loading";

const { Title, Text } = Typography;

const EventDetails = () => {
  const dispatch = useDispatch();
  const { eventDetails, loading, error } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchEventDetails());
  }, [dispatch]);

  if (loading) {
    return <div><Loading></Loading></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!eventDetails) {
    return <div>No Event Details Found</div>;
  }

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          title="Event Details"
          bordered
          hoverable
          // style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <Title level={3}>{eventDetails.event_name}</Title>
          <Text strong>Description: </Text>{eventDetails.description}
          <Divider />
          <Space direction="vertical" size="middle">
            <Text>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              Venue ID: <Tag color="geekblue">{eventDetails.venue_id}</Tag>
            </Text>
            <Text>
              <TagOutlined style={{ marginRight: 8 }} />
              Category ID: <Tag color="cyan">{eventDetails.category_id}</Tag>
            </Text>
            <Text>
              <TagOutlined style={{ marginRight: 8 }} />
              Sub-category ID: <Tag color="purple">{eventDetails.sub_category_id}</Tag>
            </Text>
            <Text>
              <GiftOutlined style={{ marginRight: 8 }} />
              Available Types: <Tag color="orange">{eventDetails.available_types}</Tag>
            </Text>
            <Text>
              <ShoppingCartOutlined style={{ marginRight: 8 }} />
              Max Tickets: <Tag color="green">{eventDetails.max_tickets}</Tag>
            </Text>
          </Space>
        </Card>
      </Col>

      {/* Event Offers */}
      <Col span={12}>
        <Card title="Event Offers" bordered hoverable>
          <List
            dataSource={eventDetails.event_offers}
            renderItem={(offer) => (
              <List.Item>
                <Card>
                  <Text strong>
                    Offer Name: <Tag color="purple">{offer.offer.name}</Tag>
                  </Text>
                  <Divider />
                  <Text>
                    Discount: <Tag color="red">{offer.offer.discount_percentage}%</Tag>
                  </Text>
                  <Text>
                    Valid From: <Tag color="green">{offer.valid_from}</Tag>
                  </Text>
                  <Text>
                    Valid To: <Tag color="volcano">{offer.valid_to}</Tag>
                  </Text>
                  <Text>
                    Max Uses: <Tag color="blue">{offer.offer.max_uses}</Tag>
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* Event Coupons */}
      <Col span={12}>
        <Card title="Event Coupons" bordered hoverable>
          <List
            dataSource={eventDetails.event_coupons}
            renderItem={(coupon) => (
              <List.Item>
                <Card>
                  <Text strong>
                    Coupon Name: <Tag color="cyan">{coupon.coupons.name}</Tag>
                  </Text>
                  <Divider />
                  <Text>
                    Coupon Code: <Tag color="orange">{coupon.coupons.coupon_code}</Tag>
                  </Text>
                  <Text>
                    Discount: <Tag color="magenta">{coupon.coupons.discount_percentage}%</Tag>
                  </Text>
                  <Text>
                    Valid From: <Tag color="green">{coupon.valid_from}</Tag>
                  </Text>
                  <Text>
                    Valid To: <Tag color="red">{coupon.valid_to}</Tag>
                  </Text>
                  <Text>
                    Min Purchase: <Tag color="gold">{coupon.coupons.min_purchase_amount}</Tag>
                  </Text>
                  <Text>
                    Max Uses: <Tag color="blue">{coupon.coupons.max_uses}</Tag>
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default EventDetails;
