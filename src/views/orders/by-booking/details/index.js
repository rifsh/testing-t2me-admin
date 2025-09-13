import React from 'react';
import { Card, Tag, Button, Divider, Progress, Timeline, Row, Col } from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    PhoneOutlined,
    MailOutlined,
    TagOutlined
} from '@ant-design/icons';

const OrderBookingDetails = () => {
    // Sample data from the API response
    const bookingData = {
        id: 27,
        amount: 600.0,
        original_amount: 600.0,
        tax_amount: 90.0,
        final_amount: 724.5,
        add_on_charge: 0.0,
        coupon_code: null,
        email: "user@example.com",
        phone: "817236487136",
        payment_status: "processing",
        qr_used: false,
        order_reference: "58e71a43-489a-41bf-be98-c3e98367a6f8",
        payment_initiated_at: "2025-08-27T07:20:45.997472",
        payment_url: "https://paypage.sandbox.ngenius-payments.com/?code=1536d00c2e1a3e34",
        created_at: "2025-08-27T07:20:28.203911",
        user: {
            id: 40,
            username: "shbk",
            email: "shbk707@gmail.com"
        },
        event: {
            id: 11,
            event_name: "MUSIC FUSION FEST",
            description: "Music Fest is a large cultural event where musicians, bands, and performers gather to present live music to audiences, often spread across multiple stages and days."
        },
        venue: {
            id: 1,
            name: "Park Hyatt",
            description: "Discover Park Hyatt Dubai, a premier event space in UAE. Perfect for weddings, conferences, and parties. Explore amenities, location, and book your event at Park Hyatt Dubai today!"
        },
        schedules: {
            id: 2,
            start_date: "2025-11-15T00:00:00",
            end_date: "2025-11-18T00:00:00"
        },
        coupon: null
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'green';
            case 'processing': return 'orange';
            case 'failed': return 'red';
            default: return 'blue';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Card className="shadow-lg rounded-xl overflow-hidden border-0">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">{bookingData.event.event_name}</h1>
                                <p className="text-purple-100">Booking Reference: {bookingData.order_reference}</p>
                            </div>
                            <Tag color={getPaymentStatusColor(bookingData.payment_status)} className="text-sm px-3 py-1 mt-4 md:mt-0">
                                {bookingData.payment_status.toUpperCase()}
                            </Tag>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Main Content Grid */}
                        <Row gutter={[24, 24]}>
                            {/* Left Column - Event Details */}
                            <Col xs={24} lg={14}>
                                <Card title="Event Details" className="mb-6 shadow-sm">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <CalendarOutlined className="text-blue-600 text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Event Dates</h3>
                                            <p className="text-gray-600">
                                                {formatDate(bookingData.schedules.start_date)} - {formatDate(bookingData.schedules.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <Divider className="my-4" />

                                    <div className="flex items-start mb-4">
                                        <div className="bg-green-100 p-3 rounded-full mr-4">
                                            <EnvironmentOutlined className="text-green-600 text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Venue</h3>
                                            <p className="text-gray-800 font-medium">{bookingData.venue.name}</p>
                                            <p className="text-gray-600 mt-1">{bookingData.venue.description.replace(/<[^>]*>/g, '')}</p>
                                        </div>
                                    </div>

                                    <Divider className="my-4" />

                                    <div className="flex items-start">
                                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                                            <UserOutlined className="text-purple-600 text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Booked By</h3>
                                            <p className="text-gray-800 font-medium">{bookingData.user.username}</p>
                                            <p className="text-gray-600">{bookingData.user.email}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Payment Information" className="shadow-sm">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Original Amount:</span>
                                            <span className="font-medium">${bookingData.original_amount.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="font-medium">${bookingData.tax_amount.toFixed(2)}</span>
                                        </div>

                                        {bookingData.add_on_charge > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Additional Charges:</span>
                                                <span className="font-medium">${bookingData.add_on_charge.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <Divider className="my-2" />

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount:</span>
                                            <span className="text-blue-600">${bookingData.final_amount.toFixed(2)}</span>
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Payment Status</span>
                                                <Tag color={getPaymentStatusColor(bookingData.payment_status)}>
                                                    {bookingData.payment_status.toUpperCase()}
                                                </Tag>
                                            </div>

                                            {bookingData.payment_status === 'processing' && (
                                                <>
                                                    <Progress percent={60} status="active" className="mb-4" />
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 border-0"
                                                        onClick={() => window.open(bookingData.payment_url, '_blank')}
                                                    >
                                                        Complete Payment
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            {/* Right Column - Timeline and Contact */}
                            <Col xs={24} lg={10}>
                                <Card title="Booking Timeline" className="mb-6 shadow-sm">
                                    <Timeline>
                                        <Timeline.Item color="green">
                                            <p className="font-semibold">Booking Created</p>
                                            <p className="text-gray-500 text-sm">
                                                {new Date(bookingData.created_at).toLocaleString()}
                                            </p>
                                        </Timeline.Item>
                                        <Timeline.Item color="blue">
                                            <p className="font-semibold">Payment Initiated</p>
                                            <p className="text-gray-500 text-sm">
                                                {new Date(bookingData.payment_initiated_at).toLocaleString()}
                                            </p>
                                        </Timeline.Item>
                                        <Timeline.Item color="gray">
                                            <p className="font-semibold">Payment Completion</p>
                                            <p className="text-gray-500 text-sm">Pending</p>
                                        </Timeline.Item>
                                        <Timeline.Item color="gray">
                                            <p className="font-semibold">QR Code Generated</p>
                                            <p className="text-gray-500 text-sm">After payment completion</p>
                                        </Timeline.Item>
                                    </Timeline>
                                </Card>

                                <Card title="Contact Information" className="shadow-sm">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <MailOutlined className="text-gray-500 mr-3" />
                                            <div>
                                                <p className="text-gray-600 text-sm">Email</p>
                                                <p className="font-medium">{bookingData.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <PhoneOutlined className="text-gray-500 mr-3" />
                                            <div>
                                                <p className="text-gray-600 text-sm">Phone</p>
                                                <p className="font-medium">{bookingData.phone}</p>
                                            </div>
                                        </div>

                                        <Divider className="my-4" />

                                        <div className="flex items-center">
                                            <TagOutlined className="text-gray-500 mr-3" />
                                            <div>
                                                <p className="text-gray-600 text-sm">Coupon Code</p>
                                                <p className="font-medium">
                                                    {bookingData.coupon_code || 'No coupon applied'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <h4 className="font-semibold text-yellow-800 flex items-center">
                                                <i className="fas fa-info-circle mr-2"></i> Important Note
                                            </h4>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                Your booking will be confirmed only after the payment is completed.
                                                You can complete the payment using the link provided.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Footer Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="large" className="border-blue-600 text-blue-600">
                                Download Invoice
                            </Button>
                            <Button size="large" className="border-purple-600 text-purple-600">
                                Contact Support
                            </Button>
                            <Button size="large" className="border-gray-600 text-gray-600">
                                Modify Booking
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OrderBookingDetails;