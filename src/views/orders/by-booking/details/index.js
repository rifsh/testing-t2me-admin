import React, { useEffect } from 'react';
import { Card, Tag, Button, Divider, Progress, Timeline, Row, Col, message, Space, Typography, Descriptions } from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    PhoneOutlined,
    MailOutlined,
    TagOutlined,
    CreditCardOutlined,
    QrcodeOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderByBookingDetails } from 'store/slices/ordersSlice';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Loading from 'components/shared-components/Loading';
import LoadingOverlay from 'components/util-components/Loader';
import SeatBookingUI from '../components/SeatBookingUI ';

const { Title, Text } = Typography;

const OrderBookingDetails = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { id, type } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAppscheduler = searchParams.get("isAppscheduler") === "true";;
    const orderId = searchParams.get("orderId");
    const showSeatId = searchParams.get("show_seat_id");
    const { ordersByBookingDetails, loading, pagination } = useSelector(
        (state) => state.orderSlice
    );

    useEffect(() => {
        console.log("sample checking", isAppscheduler);

        if (id && type && id !== "undefined" && type !== "undefined") {
            let params = {};

            if (type === 'seat') {
                params = {
                    order_id: id,
                    show_seat_id: showSeatId,
                    type,
                    // id: orderId
                };
            } else {
                params = { id, type, };
            }

            dispatch(getOrderByBookingDetails(params));
        } else {
            message.warning("Invalid booking id or type");
            navigate(-1);
        }
    }, [dispatch, id, type, orderId, showSeatId, navigate]);


    const getPaymentStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined className="text-green-500" />;
            case 'processing':
                return <ClockCircleOutlined className="text-yellow-500" />;
            case 'failed':
                return <ExclamationCircleOutlined className="text-red-500" />;
            default:
                return <ClockCircleOutlined className="text-gray-500" />;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'processing';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const end = new Date(endDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        return `${start} - ${end}`;
    };

    // Safe access to nested properties with fallbacks
    const getSafeValue = (obj, path, defaultValue = 'N/A') => {
        if (!obj) return defaultValue;

        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value === null || value === undefined) return defaultValue;
            value = value[key];
        }

        return value !== null && value !== undefined ? value : defaultValue;
    };

    if (loading) {
        return <LoadingOverlay loading={loading} />;
    }

    if (!ordersByBookingDetails) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Text className="text-gray-500">No booking details found</Text>
            </div>
        );
    }

    const order = ordersByBookingDetails;

    if (type === 'seat') {
        return (
            <SeatBookingUI
                orderData={order}
                isAppscheduler={isAppscheduler}
            />
        )
    }

    return (
        <>
            <LoadingOverlay loading={loading} />
            <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
                {isAppscheduler && (
                    <div className="mb-4">
                        <Button type="default" onClick={() => navigate(-1)}>
                            ← Back
                        </Button>
                    </div>
                )}
                {/* Header */}
                <div className="mb-6">
                    <Title level={2} className="!mb-2 text-gray-800">
                        Booking Details{" "}
                        <span className="text-sm italic text-gray-500">({type} type)</span>
                    </Title>
                    <Text className="text-gray-600">
                        Order Reference:{" "}
                        <Text code className="font-mono">
                            {getSafeValue(order, 'order_reference', 'N/A')}
                        </Text>
                    </Text>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Event Information */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-blue-500" />
                                    <span>Event Information</span>
                                </div>
                            }
                            className="shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="space-y-4">
                                <div>
                                    <Title level={4} className="!mb-2 text-gray-800">
                                        {getSafeValue(order, 'event.event_name', 'Event Name Not Available')}
                                    </Title>
                                    <Text className="text-gray-600 leading-relaxed">
                                        {getSafeValue(order, 'event.description', 'No description available')}
                                    </Text>
                                </div>

                                <Divider />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <EnvironmentOutlined className="text-green-500 text-lg" />
                                        <div>
                                            <Text strong className="block">Venue</Text>
                                            <Text className="text-gray-600">
                                                {getSafeValue(order, 'venue.name', 'Venue not specified')}
                                            </Text>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <CalendarOutlined className="text-purple-500 text-lg" />
                                        <div>
                                            <Text strong className="block">Event Dates</Text>
                                            <Text className="text-gray-600">
                                                {formatDateRange(
                                                    getSafeValue(order, 'schedules.start_date'),
                                                    getSafeValue(order, 'schedules.end_date')
                                                )}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Customer Information */}
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <UserOutlined className="text-indigo-500" />
                                    <span>Customer Information</span>
                                </div>
                            }
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mt-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <UserOutlined className="text-blue-500 text-lg" />
                                    <div>
                                        <Text strong className="block">Name</Text>
                                        <Text className="text-gray-600">
                                            {getSafeValue(order, 'user.username', 'Not provided')}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MailOutlined className="text-red-500 text-lg" />
                                    <div>
                                        <Text strong className="block">Email</Text>
                                        <Text className="text-gray-600">
                                            {getSafeValue(order, 'email', 'Not provided')}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <PhoneOutlined className="text-green-500 text-lg" />
                                    <div>
                                        <Text strong className="block">Phone</Text>
                                        <Text className="text-gray-600">
                                            {getSafeValue(order, 'phone', 'Not provided')}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <QrcodeOutlined className="text-orange-500 text-lg" />
                                    <div>
                                        <Text strong className="block">QR Status</Text>
                                        <Tag color={getSafeValue(order, 'qr_used', false) ? 'success' : 'default'}>
                                            {getSafeValue(order, 'qr_used', false) ? 'Used' : 'Not Used'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Payment & Summary */}
                    <Col xs={24} lg={8}>
                        {/* Payment Status */}
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <CreditCardOutlined className="text-green-500" />
                                    <span>Payment Status</span>
                                </div>
                            }
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                        >
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    {getPaymentStatusIcon(getSafeValue(order, 'payment_status'))}
                                    <Tag
                                        color={getPaymentStatusColor(getSafeValue(order, 'payment_status'))}
                                        className="px-4 py-1 text-sm font-medium uppercase"
                                    >
                                        {getSafeValue(order, 'payment_status', 'unknown')}
                                    </Tag>
                                </div>

                                {getSafeValue(order, 'payment_url') && getSafeValue(order, 'payment_url') !== 'N/A' && (
                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => window.open(order.payment_url, '_blank')}
                                        className="bg-blue-500 hover:bg-blue-600"
                                    >
                                        Complete Payment
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Price Breakdown */}
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <DollarOutlined className="text-green-500" />
                                    <span>Price Breakdown</span>
                                </div>
                            }
                            className="shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Text>Original Amount</Text>
                                    <Text strong>{getSafeValue(order, 'original_amount', 0).toFixed(2)}</Text>
                                </div>

                                {getSafeValue(order, 'add_on_charge', 0) > 0 && (
                                    <div className="flex justify-between">
                                        <Text>Add-on Charges</Text>
                                        <Text strong>{getSafeValue(order, 'add_on_charge', 0).toFixed(2)}</Text>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <Text>Tax Amount</Text>
                                    <Text>{getSafeValue(order, 'tax_amount', 0).toFixed(2)}</Text>
                                </div>

                                {getSafeValue(order, 'coupon_code') && getSafeValue(order, 'coupon_code') !== 'N/A' && (
                                    <div className="flex justify-between text-green-600">
                                        <Text>Coupon ({getSafeValue(order, 'coupon_code')})</Text>
                                        <Text>-{(getSafeValue(order, 'amount', 0) - getSafeValue(order, 'final_amount', 0)).toFixed(2)}</Text>
                                    </div>
                                )}

                                <Divider className="!my-3" />

                                <div className="flex justify-between">
                                    <Title level={5} className="!mb-0">Final Amount</Title>
                                    <Title level={5} className="!mb-0 text-green-600">
                                        {getSafeValue(order, 'amount', 0).toFixed(2)}
                                    </Title>
                                </div>
                            </div>
                        </Card>

                        {/* Order Timeline */}
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <FileTextOutlined className="text-purple-500" />
                                    <span>Order Timeline</span>
                                </div>
                            }
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mt-6"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: 'blue',
                                        children: (
                                            <div>
                                                <Text strong className="block">Order Created</Text>
                                                <Text className="text-gray-500 text-sm">
                                                    {formatDate(getSafeValue(order, 'created_at'))}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: getSafeValue(order, 'payment_initiated_at') ? 'orange' : 'gray',
                                        children: (
                                            <div>
                                                <Text strong className="block">Payment Initiated</Text>
                                                <Text className="text-gray-500 text-sm">
                                                    {getSafeValue(order, 'payment_initiated_at')
                                                        ? formatDate(order.payment_initiated_at)
                                                        : 'Pending'
                                                    }
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: getSafeValue(order, 'payment_status') === 'completed' ? 'green' : 'gray',
                                        children: (
                                            <div>
                                                <Text strong className="block">Payment Completed</Text>
                                                <Text className="text-gray-500 text-sm">
                                                    {getSafeValue(order, 'payment_status') === 'completed' ? 'Completed' : 'Pending'}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OrderBookingDetails;