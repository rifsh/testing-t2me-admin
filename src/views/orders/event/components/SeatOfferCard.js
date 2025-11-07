import React from "react";
import { Card, Tag, Typography, Row, Col, Divider, Space, Image, Collapse } from "antd";
import {
    GiftOutlined,
    PercentageOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    TagsOutlined,
    CaretRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Panel } = Collapse;

const SeatOfferCard = ({ offerData, title = "Applied Offers & Discounts" }) => {
    if (!offerData || offerData.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <GiftOutlined style={{ fontSize: 18, color: "#fa8c16" }} />
                <Title level={5} style={{ margin: 0 }}>
                    {title}
                </Title>
                <Tag color="orange">{offerData.length} offer(s) applied</Tag>
            </div>

            <Collapse
                bordered={false}
                expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
                expandIconPosition="end"
                style={{
                    background: "transparent",
                }}
                ghost
            >
                {offerData.map((item) => {
                    const offer = item.offer;
                    if (!offer) return null;

                    return (
                        <Panel
                            key={item.id}
                            header={
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {/* Offer Image */}
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "white",
                                                borderRadius: 6,
                                                border: "2px dashed #fa8c16",
                                            }}
                                        >
                                            {offer.thumbnail_image ? (
                                                <Image
                                                    src={offer.thumbnail_image}
                                                    alt={offer.name}
                                                    style={{
                                                        maxHeight: 30,
                                                        maxWidth: 30,
                                                        borderRadius: 4,
                                                    }}
                                                    preview={false}
                                                />
                                            ) : (
                                                <GiftOutlined
                                                    style={{ fontSize: 20, color: "#fa8c16" }}
                                                />
                                            )}
                                        </div>

                                        {/* Offer Name & Basic Info */}
                                        <div>
                                            <Text strong style={{ color: "#d46b08", fontSize: 14 }}>
                                                {offer.name}
                                            </Text>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                                <div
                                                    style={{
                                                        background: "#52c41a",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: 12,
                                                        fontWeight: "bold",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    <PercentageOutlined style={{ marginRight: 2 }} />
                                                    {offer.discount_percentage_amount}% OFF
                                                </div>
                                                <Tag
                                                    color={offer.is_offline ? "blue" : "cyan"}
                                                    style={{ fontSize: 10 }}
                                                >
                                                    {offer.is_offline ? "Offline" : "Online"}
                                                </Tag>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Tag color="green" style={{ fontSize: 11 }}>
                                            {item.used_count || 0}/{offer.max_uses} used
                                        </Tag>
                                    </div>
                                </div>
                            }
                            style={{
                                background: "linear-gradient(135deg, #fff5e6 0%, #ffe7ba 100%)",
                                border: "2px solid #fa8c16",
                                borderRadius: 8,
                                marginBottom: 8,
                                overflow: "hidden",
                            }}
                        >
                            {/* Expanded Content */}
                            <div style={{ padding: "8px 0" }}>
                                {/* Keywords */}
                                {offer.key_words && offer.key_words.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
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

                                <Divider style={{ margin: "12px 0" }} />

                                {/* Detailed Offer Information */}
                                <Row gutter={[16, 12]}>
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={4}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <CalendarOutlined
                                                    style={{ color: "#1890ff", marginRight: 6 }}
                                                />
                                                <Text strong style={{ fontSize: 12 }}>
                                                    Valid Period
                                                </Text>
                                            </div>
                                            <Text style={{ fontSize: 12, color: "#595959" }}>
                                                {dayjs(item.valid_from).format("MMM DD, YYYY")} -{" "}
                                                {dayjs(item.valid_to).format("MMM DD, YYYY")}
                                            </Text>
                                        </Space>
                                    </Col>

                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size={4}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <CheckCircleOutlined
                                                    style={{ color: "#52c41a", marginRight: 6 }}
                                                />
                                                <Text strong style={{ fontSize: 12 }}>
                                                    Used Count
                                                </Text>
                                            </div>
                                            <Tag color="green" style={{ fontSize: 12 }}>
                                                {item.used_count || 0} times
                                            </Tag>
                                        </Space>
                                    </Col>

                                    <Col xs={12} sm={6}>
                                        <Space direction="vertical" size={4}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
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

                                    {offer.description && (
                                        <Col xs={24}>
                                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                                <Text strong style={{ fontSize: 12 }}>
                                                    <TagsOutlined
                                                        style={{ color: "#fa8c16", marginRight: 6 }}
                                                    />
                                                    Description
                                                </Text>
                                                <Text style={{ fontSize: 12, color: "#595959" }}>
                                                    {offer.description}
                                                </Text>
                                            </Space>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </Panel>
                    );
                })}
            </Collapse>
        </div>
    );
};

export default SeatOfferCard;