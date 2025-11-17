import React from "react";
import { Card, Tag, Typography, Row, Col, Divider, Space, Image } from "antd";
import {
    GiftOutlined,
    PercentageOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    TagsOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CDNImage from "components/layout-components/Image/CDNImage";

const { Text, Title } = Typography;

const BookingOfferCard = ({ offerData }) => {
    if (!offerData || offerData.length === 0) {
        return null;
    }
    console.log("offerlogssss", offerData);

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <GiftOutlined style={{ fontSize: 18, color: "#fa8c16" }} />
                <Title level={5} style={{ margin: 0 }}>
                    Applied Offers & Discounts
                </Title>
                <Tag color="orange">{offerData.length} offer(s) applied</Tag>
            </div>

            <Row gutter={[12, 12]}>
                {offerData.map((item) => {
                    const offer = item.ticket_offer?.offer;
                    if (!offer) return null;

                    return (
                        <Col key={item.id} span={24}>
                            <Card
                                size="small"
                                style={{
                                    background: "linear-gradient(135deg, #fff5e6 0%, #ffe7ba 100%)",
                                    border: "2px solid #fa8c16",
                                    borderRadius: 8,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <Row gutter={16} align="middle">
                                    {/* Offer Image */}
                                    <Col>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: 8,
                                                background: "white",
                                                borderRadius: 8,
                                                border: "2px dashed #fa8c16",
                                            }}
                                        >
                                            {offer.thumbnail_image ? (
                                                // <Image
                                                //     src={offer.thumbnail_image}
                                                //     alt={offer.name}
                                                //     style={{
                                                //         maxHeight: 60,
                                                //         maxWidth: "100%",
                                                //         borderRadius: 4,
                                                //     }}
                                                //     preview={false}
                                                // />
                                                <CDNImage
                                                    src={offer.thumbnail_image}
                                                    alt={`Image Thumbnail`}
                                                    height={50}
                                                    width={80}
                                                />
                                            ) : (
                                                <GiftOutlined
                                                    style={{ fontSize: 40, color: "#fa8c16" }}
                                                />
                                            )}
                                        </div>
                                    </Col>

                                    {/* Offer Details */}
                                    <Col xs={24} sm={18} md={20}>
                                        <div style={{ padding: "4px 0" }}>
                                            {/* Offer Name & Discount */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    flexWrap: "wrap",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <TagsOutlined style={{ color: "#fa8c16" }} />
                                                    <Title
                                                        level={4}
                                                        style={{
                                                            margin: 0,
                                                            color: "#d46b08",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {offer.name}
                                                    </Title>
                                                </div>
                                                <div
                                                    style={{
                                                        background: "#52c41a",
                                                        color: "white",
                                                        padding: "4px 16px",
                                                        borderRadius: 20,
                                                        fontWeight: "bold",
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    {/* <PercentageOutlined style={{ marginRight: 4 }} /> */}
                                                    {offer.discount_percentage_amount}% OFF
                                                </div>
                                            </div>

                                            {/* Keywords */}
                                            {offer.key_words && offer.key_words.length > 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <Space size={4} wrap>
                                                        {offer.key_words.map((keyword, idx) => (
                                                            <Tag
                                                                key={idx}
                                                                color="orange"
                                                                style={{ fontSize: 11, fontWeight: "bold" }}
                                                            >
                                                                #{keyword}
                                                            </Tag>
                                                        ))}
                                                    </Space>
                                                </div>
                                            )}

                                            <Divider style={{ margin: "8px 0" }} />

                                            {/* Offer Info Grid */}
                                            <Row gutter={[16, 8]}>
                                                <Col xs={24} sm={12}>
                                                    <Space direction="vertical" size={4}>
                                                        <div>
                                                            <CalendarOutlined
                                                                style={{ color: "#1890ff", marginRight: 6 }}
                                                            />
                                                            <Text strong style={{ fontSize: 12 }}>
                                                                Valid Period
                                                            </Text>
                                                        </div>
                                                        <Text style={{ fontSize: 12, color: "#595959" }}>
                                                            {dayjs(item.ticket_offer?.valid_from).format(
                                                                "MMM DD, YYYY"
                                                            )}{" "}
                                                            -{" "}
                                                            {dayjs(item.ticket_offer?.valid_to).format(
                                                                "MMM DD, YYYY"
                                                            )}
                                                        </Text>
                                                    </Space>
                                                </Col>

                                                <Col xs={12} sm={6}>
                                                    <Space direction="vertical" size={4}>
                                                        <div>
                                                            <CheckCircleOutlined
                                                                style={{ color: "#52c41a", marginRight: 6 }}
                                                            />
                                                            <Text strong style={{ fontSize: 12 }}>
                                                                Used Count
                                                            </Text>
                                                        </div>
                                                        <Tag color="green" style={{ fontSize: 12 }}>
                                                            {item.ticket_offer?.used_count || 0} times
                                                        </Tag>
                                                    </Space>
                                                </Col>

                                                <Col xs={12} sm={6}>
                                                    <Space direction="vertical" size={4}>
                                                        <div>
                                                            <GiftOutlined
                                                                style={{ color: "#722ed1", marginRight: 6 }}
                                                            />
                                                            <Text strong style={{ fontSize: 12 }}>
                                                                Max Uses
                                                            </Text>
                                                        </div>
                                                        <Tag color="purple" style={{ fontSize: 12 }}>
                                                            {offer.max_uses} times
                                                        </Tag>
                                                    </Space>
                                                </Col>

                                                <Col xs={24}>
                                                    <Space direction="vertical" size={4}>
                                                        <Text strong style={{ fontSize: 12 }}>
                                                            <TagsOutlined
                                                                style={{ color: "#fa8c16", marginRight: 6 }}
                                                            />
                                                            Offer Type
                                                        </Text>
                                                        <Tag
                                                            color={offer.is_offline ? "blue" : "cyan"}
                                                            style={{ fontSize: 11 }}
                                                        >
                                                            {offer.is_offline ? "Offline Offer" : "Online Offer"}
                                                        </Tag>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default BookingOfferCard;