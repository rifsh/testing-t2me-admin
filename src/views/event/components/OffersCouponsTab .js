import { Row, Col, Card, Typography, Empty, Image } from "antd";
import CDNImage from "components/layout-components/Image/CDNImage";
import { discounts } from "constants/AppConstants";
import OfferDetailsModal from "./OfferDetailsModal";
import { useState } from "react";

const { Title } = Typography;

const OffersCouponsTab = ({ eventDetails }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState();
  const [type, setType] = useState(null);

  const handleCardClick = (data, type) => {
    if (type === discounts.offer) {
      console.log(data);
      setData(data?.offer);
      setType(type)
      setIsModalVisible(true);
    } else if (type === discounts.coupon) {
      console.log(data);
      setData(data?.coupons);
      setType(type)
      setIsModalVisible(true);
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Offers Section */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: "16px", color: "#1890ff" }}>
            Special Offers
          </Title>
          {eventDetails?.event_offers?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {eventDetails?.event_offers?.map((offer, index) => (
                <Col span={24} key={index}>
                  <Card
                    hoverable
                    onClick={() => { handleCardClick(offer, discounts.offer) }}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #d9f7be",
                      backgroundColor: "#F6FFED",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={8}>
                        {offer.offer.thumbnail_image !== "images" &&
                          offer.offer.thumbnail_image ? (
                          // <Image
                          //   alt="offer thumbnail"
                          //   src={offer.offer.thumbnail_image}
                          //   height={100}
                          //   style={{
                          //     objectFit: "cover",
                          //     width: "100%",
                          //     borderRadius: "8px",
                          //     border: "1px solid #b7eb8f",
                          //   }}
                          // />
                          <CDNImage
                            src={offer.offer.thumbnail_image}
                            height={'200px'}
                          />
                        ) : (
                          <div
                            style={{
                              height: 100,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#f6ffed",
                              color: "#52c41a",
                              borderRadius: "8px",
                              border: "1px dashed #b7eb8f",
                              fontSize: "24px",
                            }}
                          >
                            🏷️
                          </div>
                        )}
                      </Col>
                      <Col xs={24} md={16}>
                        <Title
                          level={4}
                          style={{ color: "#389e0d", margin: "0 0 8px 0" }}
                        >
                          {offer.offer.name}
                        </Title>
                        {offer.offer.is_percentage ? (
                          < div
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "16px",
                              display: "inline-block",
                              fontWeight: "bold",
                              color: "#389e0d",
                              marginBottom: "12px",
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            {offer.offer.discount_percentage_amount}% OFF
                          </div>
                        ) : (
                          < div
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "16px",
                              display: "inline-block",
                              fontWeight: "bold",
                              color: "#389e0d",
                              marginBottom: "12px",
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            {offer.offer.discount_percentage_amount?.toFixed(2)}
                          </div>
                        )
                        }
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <div style={{ color: "#666" }}>
                            <span
                              style={{ fontWeight: "500", marginRight: "4px" }}
                            >
                              Max Uses:
                            </span>
                            {offer.offer.max_uses}
                          </div>
                          <div style={{ color: "#666" }}>
                            <span
                              style={{ fontWeight: "500", marginRight: "4px" }}
                            >
                              Valid:
                            </span>
                            {offer.offer.start_date} - {offer.offer.end_date}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No special offers available"
              style={{ margin: "20px 0" }}
            />
          )}
        </Col>

        {/* Coupons Section */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: "16px", color: "#1890ff" }}>
            Event Coupons
          </Title>
          {eventDetails?.event_coupons?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {eventDetails?.event_coupons?.map((coupon, index) => (
                <Col span={24} key={index}>
                  <Card
                    hoverable
                    onClick={() => { handleCardClick(coupon, discounts.coupon) }}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #bae7ff",
                      backgroundColor: "#E6F7FF",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={8}>
                        {coupon.coupons.thumbnail_image !== "images" &&
                          coupon.coupons.thumbnail_image ? (
                          // <Image
                          //   alt="coupon thumbnail"
                          //   src={coupon.coupons.thumbnail_image}
                          //   height={100}
                          //   style={{
                          //     objectFit: "cover",
                          //     width: "100%",
                          //     borderRadius: "8px",
                          //     border: "1px solid #91d5ff",
                          //   }}
                          // />
                          <CDNImage
                            src={coupon.coupons.thumbnail_image}
                            height={'200px'}
                          />
                        ) : (
                          <div
                            style={{
                              height: 100,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#e6f7ff",
                              color: "#1890ff",
                              borderRadius: "8px",
                              border: "1px dashed #91d5ff",
                              fontSize: "24px",
                            }}
                          >
                            🎟️
                          </div>
                        )}
                      </Col>
                      <Col xs={24} md={16}>
                        <Title
                          level={4}
                          style={{ color: "#096dd9", margin: "0 0 8px 0" }}
                        >
                          {coupon.coupons.name}
                        </Title>
                        {coupon?.is_percentage ? (
                          <div
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#e6f7ff",
                              borderRadius: "16px",
                              display: "inline-block",
                              fontWeight: "bold",
                              color: "#096dd9",
                              marginBottom: "12px",
                              border: "1px solid #91d5ff",
                            }}
                          >
                            {coupon.coupons.discount_percentage_amount}% OFF
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#e6f7ff",
                              borderRadius: "16px",
                              display: "inline-block",
                              fontWeight: "bold",
                              color: "#096dd9",
                              marginBottom: "12px",
                              border: "1px solid #91d5ff",
                            }}
                          >
                            {coupon.coupons.discount_percentage_amount?.toFixed(2)}
                          </div>
                        )
                        }
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <div style={{ color: "#666" }}>
                            <span
                              style={{ fontWeight: "500", marginRight: "4px" }}
                            >
                              Max Uses:
                            </span>
                            {coupon.coupons.max_uses}
                          </div>
                          <div style={{ color: "#666" }}>
                            <span
                              style={{ fontWeight: "500", marginRight: "4px" }}
                            >
                              Valid:
                            </span>
                            {coupon.coupons.start_date} -{" "}
                            {coupon.coupons.end_date}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No special coupons available"
              style={{ margin: "20px 0" }}
            />
          )}
        </Col>
      </Row >
      <OfferDetailsModal
        open={isModalVisible}
        onClose={() => { setIsModalVisible(false) }}
        offer={data}
        type={type}
      />
    </div >
  );
};

export default OffersCouponsTab;
