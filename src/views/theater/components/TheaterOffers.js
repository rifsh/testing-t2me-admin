import React from 'react';
import { Card, Tag, Typography, Empty, Tabs } from 'antd';
import {
    GiftOutlined,
    ClockCircleOutlined,
    PercentageOutlined,
    TagOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TheaterOffers = ({ theaterData }) => {
    const movieCoupons = theaterData?.movie_coupons || [];
    const movieOffers = theaterData?.movie_offers || [];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getDaysRemaining = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        const expiryDate = new Date(dateString);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isExpiringSoon = (endDate) => {
        const daysRemaining = getDaysRemaining(endDate);
        return daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
    };


    const renderCouponCard = (coupon) => {
        const couponDetails = coupon.coupons;
        if (!couponDetails) return null;

        const daysRemaining = getDaysRemaining(couponDetails.end_date);
        const expiringStatus = isExpiringSoon(couponDetails.end_date);

        return (
            <Card
                key={coupon.id}
                className="mb-4"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <TagOutlined className="text-green-600 mr-2 text-xl" />
                            <Title level={4} className="m-0">{couponDetails.name}</Title>
                            {couponDetails.is_percentage && (
                                <Tag color="green" className="ml-2">{couponDetails.discount_percentage_amount}% OFF</Tag>
                            )}
                        </div>

                        {couponDetails.thumbnail_image && couponDetails.thumbnail_image !== "images" && (
                            <div className="mb-3">
                                <img
                                    src={couponDetails.thumbnail_image}
                                    alt={couponDetails.name}
                                    className="h-16 object-contain rounded"
                                />
                            </div>
                        )}

                        <div className="flex items-center text-gray-500 mb-2">
                            <ClockCircleOutlined className="mr-1" />
                            <Text>
                                Valid: {formatDate(couponDetails.start_date)} - {formatDate(couponDetails.end_date)}
                                {expiringStatus && (
                                    <Tag color="orange" className="ml-2">
                                        Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                                    </Tag>
                                )}
                            </Text>
                        </div>

                        <div className="text-gray-500 mb-2">
                            <Text>
                                <InfoCircleOutlined className="mr-1" />
                                Uses: {couponDetails.used_count}/{couponDetails.max_uses}
                            </Text>
                        </div>
                    </div>

                    {/* <div className="flex flex-col items-center mt-4 md:mt-0">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg mb-2 flex items-center">
                            <Text strong className="text-lg mr-2">{couponDetails.name}</Text>
                            <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(couponDetails.name)}
                                size="small"
                                disabled={!active}
                            />
                        </div>
                        <Button
                            type="primary"
                            shape="round"
                            disabled={!active}
                            onClick={() => window.open('#', '_blank')}
                        >
                            Use Coupon
                        </Button>
                    </div> */}
                </div>
            </Card>
        );
    };

    const renderOfferCard = (offer) => {
        const offerDetails = offer.offer;
        if (!offerDetails) return null;

        const daysRemaining = getDaysRemaining(offerDetails.end_date);
        const expiringStatus = isExpiringSoon(offerDetails.end_date);

        return (
            <Card
                key={offer.id}
                className="mb-4"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <PercentageOutlined className="text-blue-500 mr-2 text-xl" />
                            <Title level={4} className="m-0">{offerDetails.name}</Title>
                            {offerDetails.is_percentage && (
                                <Tag color="blue" className="ml-2">{offerDetails.discount_percentage_amount}% OFF</Tag>
                            )}
                        </div>

                        {offerDetails.thumbnail_image && offerDetails.thumbnail_image !== "images" && (
                            <div className="mb-3">
                                <img
                                    src={offerDetails.thumbnail_image}
                                    alt={offerDetails.name}
                                    className="h-16 object-contain rounded"
                                />
                            </div>
                        )}

                        <div className="flex items-center text-gray-500 mb-2">
                            <ClockCircleOutlined className="mr-1" />
                            <Text>
                                Valid: {formatDate(offerDetails.start_date)} - {formatDate(offerDetails.end_date)}
                                {expiringStatus && (
                                    <Tag color="orange" className="ml-2">
                                        Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                                    </Tag>
                                )}
                            </Text>
                        </div>

                        <div className="text-gray-500 mb-2">
                            <Text>
                                <InfoCircleOutlined className="mr-1" />
                                Uses: {offerDetails.used_count}/{offerDetails.max_uses}
                            </Text>
                        </div>
                    </div>

                    <div className="flex flex-col items-center mt-4 md:mt-0">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg mb-2 text-center">
                            {offerDetails.is_percentage ? (
                                <Text strong className="text-xl text-blue-600">{offerDetails.discount_percentage_amount}% OFF</Text>
                            ) : (
                                <Text strong className="text-xl text-blue-600">Special Offer</Text>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <>
            <div className="my-8">
                <Card
                    title={
                        <div className="flex items-center">
                            <GiftOutlined className="text-blue-500 mr-2 text-xl" />
                            <span>Promotions</span>
                        </div>
                    }
                >
                    <Tabs defaultActiveKey="offers">
                        <TabPane
                            tab={
                                <span>
                                    <PercentageOutlined /> Offers ({movieOffers.length})
                                </span>
                            }
                            key="offers"
                        >
                            {movieOffers.length > 0 ? (
                                <div className="space-y-4">
                                    {movieOffers.map(renderOfferCard)}
                                </div>
                            ) : (
                                <Empty
                                    description="No current offers available"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <TagOutlined /> Coupons ({movieCoupons.length})
                                </span>
                            }
                            key="coupons"
                        >
                            {movieCoupons.length > 0 ? (
                                <div className="space-y-4">
                                    {movieCoupons.map(renderCouponCard)}
                                </div>
                            ) : (
                                <Empty
                                    description="No current coupons available"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </>
    );
};

export default TheaterOffers;