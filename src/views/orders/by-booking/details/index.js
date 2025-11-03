import React, { useEffect } from 'react';
import { Card, Tag, Button, Divider, Row, Col, message, Space, Typography, Descriptions, List, Badge, Statistic } from 'antd';
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
    ExclamationCircleOutlined,
    IdcardOutlined,
    ScheduleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderByBookingDetails } from 'store/slices/ordersSlice';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Loading from 'components/shared-components/Loading';
import LoadingOverlay from 'components/util-components/Loader';
import SeatBookingUI from '../components/SeatBookingUI ';
import { AirplaneTicketOutlined } from '@mui/icons-material';
import { qrUsed } from 'constants/QrConstants';

const { Title, Text } = Typography;

const OrderBookingDetails = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { id, type } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAppscheduler = searchParams.get("isAppscheduler") === "true";
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
                };
            } else {
                params = { id, type };
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
            case 'paid':
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
            case 'paid':
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

    const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = formatDateOnly(startDate);
        const end = formatDateOnly(endDate);
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
            <div className="bg-gray-50 min-h-screen p-4">
                <div className="mb-4">
                    <Button type="dashed" onClick={() => navigate(-1)}>
                        ← Back
                    </Button>
                </div>

                {/* Header Section */}
                <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <Title level={2} className="!mb-2 text-gray-800">
                                Booking Confirmation
                            </Title>
                            <div className="flex flex-wrap items-center gap-4">
                                <Text className="text-gray-600">
                                    Order Reference:{" "}
                                    <Text code className="font-mono bg-blue-50">
                                        {getSafeValue(order, 'order_reference')}
                                    </Text>
                                </Text>
                                <Tag color="blue" icon={<TagOutlined />}>
                                    {type?.toUpperCase()} Booking
                                </Tag>
                                <Badge
                                    status={getSafeValue(order, 'payment_status') === 'paid' ? 'success' : 'processing'}
                                    text={`Payment ${getSafeValue(order, 'payment_status')}`}
                                />
                            </div>
                        </div>
                        {/* <div className="mt-4 lg:mt-0">
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() => window.print()}
                            >
                                Print Details
                            </Button>
                        </div> */}
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Main Content */}
                    <Col xs={24} lg={16}>
                        {/* Event & Booking Summary */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                            title={
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-blue-500" />
                                    <span>Event & Booking Summary</span>
                                </div>
                            }
                        >
                            <div className="space-y-6">
                                <div>
                                    <Title level={3} className="!mb-3 text-gray-800">
                                        {getSafeValue(order, 'event.event_name')}
                                    </Title>
                                    <Text className="text-gray-600 leading-relaxed text-base">
                                        {getSafeValue(order, 'event.description')}
                                    </Text>
                                </div>

                                <Divider />

                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <div className="flex items-start gap-3">
                                            <EnvironmentOutlined className="text-green-500 text-lg mt-1" />
                                            <div>
                                                <Text strong className="block text-gray-700">Venue</Text>
                                                <Text className="text-gray-600">
                                                    {getSafeValue(order, 'venue.name')}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div className="flex items-start gap-3">
                                            <CalendarOutlined className="text-purple-500 text-lg mt-1" />
                                            <div>
                                                <Text strong className="block text-gray-700">Event Period</Text>
                                                <Text className="text-gray-600">
                                                    {formatDateRange(
                                                        getSafeValue(order, 'schedules.start_date'),
                                                        getSafeValue(order, 'schedules.end_date')
                                                    )}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card>

                        {/* Booking Items / Tickets */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                            title={
                                <div className="flex items-center gap-2">
                                    <AirplaneTicketOutlined className="text-orange-500" />
                                    <span>Ticket Details</span>
                                </div>
                            }
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={getSafeValue(order, 'booking_items', [])}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <div className="w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <Text strong className="text-gray-800">
                                                    Ticket {index + 1}
                                                </Text>
                                                <Tag color="blue">
                                                    {getSafeValue(item, 'num_of_tickets')} {getSafeValue(item, 'num_of_tickets') > 1 ? 'Tickets' : 'Ticket'}
                                                </Tag>
                                            </div>
                                            <Row gutter={[16, 8]} className="text-sm">
                                                <Col xs={24} sm={8}>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarOutlined className="text-gray-400" />
                                                        <Text strong>Date:</Text>
                                                    </div>
                                                    <Text className="text-gray-600 ml-6">
                                                        {formatDateOnly(getSafeValue(item, 'show_date.start_date'))}
                                                    </Text>
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <div className="flex items-center gap-2">
                                                        <ScheduleOutlined className="text-gray-400" />
                                                        <Text strong>Time:</Text>
                                                    </div>
                                                    <Text className="text-gray-600 ml-6">
                                                        {formatTime(getSafeValue(item, 'show_time.start_time'))} - {formatTime(getSafeValue(item, 'show_time.end_time'))}
                                                    </Text>
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <div className="flex items-center gap-2">
                                                        <DollarOutlined className="text-gray-400" />
                                                        <Text strong>Price:</Text>
                                                    </div>
                                                    <Text className="text-gray-600 ml-6">
                                                        {getSafeValue(item, 'unit_price', 0).toFixed(2)} each
                                                    </Text>
                                                </Col>
                                            </Row>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        {/* Customer Information */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200"
                            title={
                                <div className="flex items-center gap-2">
                                    <UserOutlined className="text-indigo-500" />
                                    <span>Customer Information</span>
                                </div>
                            }
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <IdcardOutlined className="text-blue-500 text-lg" />
                                        <div>
                                            <Text strong className="block text-gray-700">Customer Name</Text>
                                            <Text className="text-gray-600">
                                                {getSafeValue(order, 'user.username')}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MailOutlined className="text-red-500 text-lg" />
                                        <div>
                                            <Text strong className="block text-gray-700">Email Address</Text>
                                            <Text className="text-gray-600">
                                                {getSafeValue(order, 'email')}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <PhoneOutlined className="text-green-500 text-lg" />
                                        <div>
                                            <Text strong className="block text-gray-700">Phone Number</Text>
                                            <Text className="text-gray-600">
                                                {getSafeValue(order, 'phone') || 'Not provided'}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <QrcodeOutlined className="text-orange-500 text-lg" />
                                        <div>
                                            <Text strong className="block text-gray-700">QR Code Status</Text>
                                            <Tag
                                                color={getSafeValue(order, 'qr_used', false) ? 'green' : 'blue'}
                                                className="mt-1"
                                            >
                                                {getSafeValue(order, 'qr_used', false) ? qrUsed.used : qrUsed.notUsed}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Right Column - Sidebar Information */}
                    <Col xs={24} lg={8}>
                        {/* Payment Status Card */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                            title={
                                <div className="flex items-center gap-2">
                                    <CreditCardOutlined className="text-green-500" />
                                    <span>Payment Information</span>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        {getPaymentStatusIcon(getSafeValue(order, 'payment_status'))}
                                        <Tag
                                            color={getPaymentStatusColor(getSafeValue(order, 'payment_status'))}
                                            className="px-4 py-1 text-sm font-medium uppercase"
                                        >
                                            {getSafeValue(order, 'payment_status', 'unknown')}
                                        </Tag>
                                    </div>

                                    <div className="space-y-2 text-left">
                                        <div className="flex justify-between">
                                            <Text className="text-gray-600">Payment Mode:</Text>
                                            <Text strong>{getSafeValue(order, 'payment_mode')}</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text className="text-gray-600">Platform:</Text>
                                            <Text strong>{getSafeValue(order, 'payment_platform')}</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text className="text-gray-600">Initiated:</Text>
                                            <Text strong>{formatDate(getSafeValue(order, 'payment_initiated_at'))}</Text>
                                        </div>
                                    </div>
                                </div>

                                {getSafeValue(order, 'payment_url') && getSafeValue(order, 'payment_url') !== 'N/A' && (
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        onClick={() => window.open(order.payment_url, '_blank')}
                                        className="bg-blue-500 hover:bg-blue-600 mt-4"
                                    >
                                        Complete Payment
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Price Breakdown */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                            title={
                                <div className="flex items-center gap-2">
                                    <DollarOutlined className="text-green-500" />
                                    <span>Price Breakdown</span>
                                </div>
                            }
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <Text className="text-gray-600">Original Amount</Text>
                                    <Text strong>{getSafeValue(order, 'original_amount', 0).toFixed(2)}</Text>
                                </div>

                                {getSafeValue(order, 'add_on_charge', 0) > 0 && (
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                        <Text className="text-gray-600">Add-on Charges</Text>
                                        <Text strong className="text-orange-600">
                                            +{getSafeValue(order, 'add_on_charge', 0).toFixed(2)}
                                        </Text>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                    <Text className="text-gray-600">Tax Amount</Text>
                                    <Text className="text-red-600">
                                        {getSafeValue(order, 'tax_amount', 0).toFixed(2)}
                                    </Text>
                                </div>

                                {getSafeValue(order, 'coupon_code') && getSafeValue(order, 'coupon_code') !== 'N/A' && (
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                        <Text className="text-gray-600">
                                            Coupon ({getSafeValue(order, 'coupon_code')})
                                        </Text>
                                        <Text className="text-green-600">
                                            -{(getSafeValue(order, 'amount', 0) - getSafeValue(order, 'final_amount', 0)).toFixed(2)}
                                        </Text>
                                    </div>
                                )}

                                <Divider className="!my-3" />

                                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3">
                                    <Title level={5} className="!mb-0 text-gray-800">Total Amount</Title>
                                    <Title level={4} className="!mb-0 text-green-600">
                                        {getSafeValue(order, 'amount', 0).toFixed(2)}
                                    </Title>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                            title={
                                <div className="flex items-center gap-2">
                                    <InfoCircleOutlined className="text-purple-500" />
                                    <span>Booking Overview</span>
                                </div>
                            }
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title="Total Tickets"
                                        value={getSafeValue(order, 'booking_items', []).reduce((sum, item) => sum + getSafeValue(item, 'num_of_tickets', 0), 0)}
                                        prefix={<AirplaneTicketOutlined />}
                                        valueStyle={{ color: '#3f51b5' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Time Slots"
                                        value={getSafeValue(order, 'booking_items', []).length}
                                        prefix={<ScheduleOutlined />}
                                        valueStyle={{ color: '#f44336' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Order Timeline */}
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow duration-200"
                            title={
                                <div className="flex items-center gap-2">
                                    <FileTextOutlined className="text-blue-500" />
                                    <span>Order Timeline</span>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(order, 'created_at') ? 'bg-blue-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Order Created</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {formatDate(getSafeValue(order, 'created_at'))}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(order, 'payment_initiated_at') ? 'bg-orange-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Payment Initiated</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {getSafeValue(order, 'payment_initiated_at')
                                                ? formatDate(order.payment_initiated_at)
                                                : 'Pending'
                                            }
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(order, 'payment_status') === 'paid' ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Payment Status</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {order?.payment_status}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OrderBookingDetails;