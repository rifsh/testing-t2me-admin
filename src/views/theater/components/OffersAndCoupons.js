import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Typography, Row, Col, Button, Alert, Badge, Tooltip } from 'antd';
import { CloseCircleOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';
import { toggleSelectedCoupon, toggleSelectedOffer } from 'store/slices/eventSlice';

const { Text, Title } = Typography;

const OffersAndCouponsPanel = ({ mode = "CREATE" }) => {
    const dispatch = useDispatch();

    // Get data from Redux store using useSelector
    const { selectedOffers, selectedCoupons } = useSelector(
        (state) => state.event
    );
    const { filteredCoupons, loading: couponLoading } = useSelector(
        (state) => state.coupons
    );

    // Handler functions
    const handleDeleteOffer = (offer) => {
        dispatch(toggleSelectedOffer(offer));
    };

    const handleDeleteCoupon = (coupon) => {
        dispatch(toggleSelectedCoupon(coupon));
    };

    return (
        <Row gutter={[24, 16]}>
            <Col xs={24} sm={24} md={12} style={{ paddingRight: 12 }}>
                {/* Offers Section */}
                <div style={{ marginBottom: 24 }}>
                    {selectedOffers.length > 0 && (
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <Badge count={selectedOffers.length} style={{ backgroundColor: '#108ee9', marginRight: 8 }} />
                            Selected Offers
                        </Title>
                    )}

                    {selectedOffers.map((offer) => (
                        <Card
                            key={offer.id}
                            size="small"
                            className="hover-shadow"
                            style={{
                                cursor: "pointer",
                                marginBottom: 12,
                                position: "relative",
                                borderRadius: 8,
                                transition: "all 0.3s ease"
                            }}
                        >
                            {mode !== "EDIT" && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleDeleteOffer(offer)}
                                    style={{
                                        position: "absolute",
                                        top: -10,
                                        right: -10,
                                        zIndex: 10,
                                    }}
                                />
                            )}

                            <div style={{ padding: "4px 8px" }}>
                                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 15, color: "#1a1a1a" }}>
                                        <TagOutlined style={{ marginRight: 6, color: "#1890ff" }} />
                                        {offer.name}
                                    </Text>
                                    <Tooltip title="Maximum usage limit">
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: "#484848",
                                                backgroundColor: "#e6f7ff",
                                                padding: "3px 10px",
                                                borderRadius: 12,
                                                fontWeight: 500
                                            }}
                                        >
                                            Max Uses: {offer.max_uses}
                                        </Text>
                                    </Tooltip>
                                </Row>

                                {offer.date_required ? (
                                    <Row justify="space-between" align="middle">
                                        <Col span={11}>
                                            <Text style={{ fontSize: 11, color: "#555", display: "block" }}>
                                                <CalendarOutlined style={{ marginRight: 4, color: "#1890ff" }} />
                                                Start: {offer.start_date}
                                            </Text>
                                        </Col>
                                        <Col span={11} style={{ textAlign: "right" }}>
                                            <Text style={{ fontSize: 11, color: "#555", display: "block" }}>
                                                <CalendarOutlined style={{ marginRight: 4, color: "#ff4d4f" }} />
                                                End: {offer.end_date}
                                            </Text>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            lineHeight: "16px",
                                            margin: 0,
                                            padding: "4px 0",
                                            color: "#fa8c16",
                                            fontStyle: "italic"
                                        }}
                                    >
                                        You can specify a date for this offer during scheduling, if needed.
                                    </Text>
                                )}
                            </div>
                        </Card>
                    ))}

                    {mode === "EDIT" && selectedOffers.length > 0 && (
                        <Alert
                            message="You cannot delete an offer. We need this data for auditing purpose. You are allowed to add only the offer."
                            type="info"
                            style={{
                                marginTop: 12,
                                fontSize: 12,
                                padding: 10,
                                borderRadius: 6
                            }}
                        />
                    )}
                </div>
            </Col>

            <Col xs={24} sm={24} md={12} style={{ paddingLeft: 12 }}>
                {/* Coupons Section */}
                <div style={{ marginBottom: 16 }}>
                    {selectedCoupons.length > 0 && (
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <Badge count={selectedCoupons.length} style={{ backgroundColor: '#52c41a', marginRight: 8 }} />
                            Selected Coupons
                        </Title>
                    )}

                    {selectedCoupons.map((coupon) => (
                        <Card
                            key={coupon.id}
                            size="small"
                            className="hover-shadow"
                            style={{
                                cursor: "pointer",
                                marginBottom: 12,
                                position: "relative",
                                borderRadius: 8,
                                border: "1px solid #d9f7be",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleDeleteCoupon(coupon)}
                                style={{
                                    position: "absolute",
                                    top: -10,
                                    right: -10,
                                    zIndex: 10,
                                }}
                            />

                            <div style={{ padding: "4px 8px" }}>
                                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                    <Text strong style={{ fontSize: 15, color: "#1a1a1a" }}>
                                        <TagOutlined style={{ marginRight: 6, color: "#52c41a" }} />
                                        {coupon.name}
                                    </Text>
                                    <Tooltip title="Maximum usage limit">
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: "#484848",
                                                backgroundColor: "#f6ffed",
                                                padding: "3px 10px",
                                                borderRadius: 12,
                                                fontWeight: 500
                                            }}
                                        >
                                            Max Uses: {coupon.max_uses}
                                        </Text>
                                    </Tooltip>
                                </Row>

                                <Row justify="space-between" align="middle">
                                    <Col span={11}>
                                        <Text style={{ fontSize: 11, color: "#555", display: "block" }}>
                                            <CalendarOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                                            Start: {coupon.start_date}
                                        </Text>
                                    </Col>
                                    <Col span={11} style={{ textAlign: "right" }}>
                                        <Text style={{ fontSize: 11, color: "#555", display: "block" }}>
                                            <CalendarOutlined style={{ marginRight: 4, color: "#ff4d4f" }} />
                                            End: {coupon.end_date}
                                        </Text>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    ))}
                </div>
            </Col>

            {/* Add some global styles */}
            <style jsx global>{`
        .hover-shadow:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
    `}</style>
        </Row>
    );
};

export default OffersAndCouponsPanel;