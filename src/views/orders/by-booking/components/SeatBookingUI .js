import React from 'react';
import { Card, Descriptions, Table, Tag, Badge, Space, Typography, Divider, Empty, Button } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    CreditCardOutlined,
    CalendarOutlined,
    MailOutlined,
    DollarOutlined,
    QuestionCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SeatBookingUI = ({ orderData, isAppscheduler }) => {
    const navigate = useNavigate();
    // Check if orderData exists and has required structure
    if (!orderData || !orderData.order_data) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <Empty
                    description="No order data available"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';

        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    const getPaymentStatusColor = (status) => {
        if (!status) return 'default';

        const colors = {
            'paid': 'success',
            'pending': 'warning',
            'failed': 'error',
            'cancelled': 'default'
        };
        return colors[status.toLowerCase()] || 'default';
    };

    const getPaymentStatusText = (status) => {
        if (!status) return 'UNKNOWN';
        return status.toUpperCase();
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
        return `${parseFloat(amount).toFixed(2)}`;
    };

    const seatColumns = [
        {
            title: 'Seat ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => id ? <Text strong>#{id}</Text> : <Text type="secondary">N/A</Text>
        },
        {
            title: 'Seat Label',
            dataIndex: 'label',
            key: 'label',
            render: (label) => label ?
                <Badge count={label} style={{ backgroundColor: '#52c41a' }} /> :
                <Tag icon={<QuestionCircleOutlined />}>No label</Tag>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => type ?
                <Tag color="blue">{type.toUpperCase()}</Tag> :
                <Tag color="default">UNKNOWN</Tag>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text strong>{formatCurrency(price)}</Text>
        }
    ];

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

    // Safely extract data with fallbacks
    const orderInfo = orderData.order_data || {};
    const seats = Array.isArray(orderInfo.seats) ? orderInfo.seats : [];

    return (
        <div className="bg-gray-50 min-h-screen">
            {isAppscheduler && (
                <div className="mb-4">
                    <Button type="dashed" onClick={() => navigate(-1)}>
                        ← Back
                    </Button>
                </div>
            )}
            <div className="">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2} className="flex items-center gap-2 mb-2">
                        Booking Details
                        <span className="text-sm italic text-gray-500">(seat type)</span>
                    </Title>
                    <Text type="secondary">Order ID: {orderData.order_id || 'N/A'}</Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Order Info */}
                        <Card title={<span><UserOutlined className="mr-2" />Order Information</span>} className="shadow-sm">
                            <Descriptions column={2} bordered size="small">
                                <Descriptions.Item label="Order ID" span={2}>
                                    {orderData.order_id ?
                                        <Text copyable>{orderData.order_id}</Text> :
                                        <Text type="secondary">Not available</Text>
                                    }
                                </Descriptions.Item>
                                {/* <Descriptions.Item label="Internal ID">
                                    {orderData.id ?
                                        <Text strong>#{orderData.id}</Text> :
                                        <Text type="secondary">N/A</Text>
                                    }
                                </Descriptions.Item> */}
                                {/* <Descriptions.Item label="Show Seat Details ID">
                                    {orderData.show_seat_details_id ?
                                        <Text strong>#{orderData.show_seat_details_id}</Text> :
                                        <Text type="secondary">N/A</Text>
                                    }
                                </Descriptions.Item> */}
                                <Descriptions.Item label="Order Reference" span={2}>
                                    {orderInfo.order_reference ?
                                        <Text copyable>{orderInfo.order_reference}</Text> :
                                        <Text type="secondary">Not available</Text>
                                    }
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {formatDate(orderData.created_at)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Order Date">
                                    {formatDate(orderInfo.created_at)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Customer Information */}
                        <Card title={<span><MailOutlined className="mr-2" />Customer Information</span>} className="shadow-sm">
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Email">
                                    {orderInfo.email ?
                                        <Text copyable>{orderInfo.email}</Text> :
                                        <Text type="secondary">Not provided</Text>
                                    }
                                </Descriptions.Item>
                                <Descriptions.Item label="Phone">
                                    {orderInfo.phone ?
                                        orderInfo.phone :
                                        <Text type="secondary">Not provided</Text>
                                    }
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Seat Details */}
                        <Card
                            title={<span><CalendarOutlined className="mr-2" />Seat Details</span>}
                            className="shadow-sm"
                        >
                            {seats.length > 0 ? (
                                <Table
                                    dataSource={seats}
                                    columns={seatColumns}
                                    pagination={false}
                                    rowKey="id"
                                    size="small"
                                />
                            ) : (
                                <Empty
                                    description="No seat information available"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </Card>
                        {/* Payment URL */}
                        {orderInfo.payment_url && (
                            <Card title="Payment URL" className="shadow-sm">
                                <Text copyable={{ text: orderInfo.payment_url }} className="text-xs break-all">
                                    {orderInfo.payment_url}
                                </Text>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Payment & Financial Details */}
                    <div className="space-y-6">
                        {/* Payment Status */}
                        <Card title={<span><CreditCardOutlined className="mr-2" />Payment Status</span>} className="shadow-sm">
                            <div className="text-center mb-4">
                                <Tag
                                    color={getPaymentStatusColor(orderInfo.payment_status)}
                                    className="text-lg px-4 py-2"
                                >
                                    {getPaymentStatusText(orderInfo.payment_status)}
                                </Tag>
                            </div>
                            <Descriptions column={1} size="small">
                                {/* <Descriptions.Item label="Payment Method ID">
                                    {orderInfo.payment_method_id ?
                                        `#${orderInfo.payment_method_id}` :
                                        <Text type="secondary">Not available</Text>
                                    }
                                </Descriptions.Item> */}
                                <Descriptions.Item label="Payment Initiated">
                                    {formatDate(orderInfo.payment_initiated_at)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Financial Breakdown */}
                        <Card title={<span><DollarOutlined className="mr-2" />Financial Details</span>} className="shadow-sm">
                            <div className="space-y-3">
                                {orderInfo?.payment_mode && <div className="flex justify-between">
                                    <Text>Payment Mode:</Text>
                                    <Text strong>{orderInfo.payment_mode}</Text>
                                </div>}
                                {orderInfo?.payment_mode && <div className="flex justify-between">
                                    <Text>Payment Platform:</Text>
                                    <Text strong>{orderInfo?.payment_platform}</Text>
                                </div>}
                                <div className="flex justify-between">
                                    <Text>Original Amount:</Text>
                                    <Text strong>{formatCurrency(orderInfo.original_amount)}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Discount:</Text>
                                    <Text type={orderInfo.discounted_amount > 0 ? "success" : "secondary"}>
                                        -{formatCurrency(orderInfo.discounted_amount)}
                                    </Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Amount After Discount:</Text>
                                    <Text>{formatCurrency(orderInfo.amount_after_discount)}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Tax Amount:</Text>
                                    <Text>{formatCurrency(orderInfo.tax_amount)}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Payment Charge:</Text>
                                    <Text>{formatCurrency(orderInfo.payment_charge)}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Add-on Charge:</Text>
                                    <Text>{formatCurrency(orderInfo.add_on_charge)}</Text>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex justify-between text-lg">
                                    <Text strong>Final Amount:</Text>
                                    <Text strong className="text-green-600">
                                        {formatCurrency(orderInfo.final_amount)}
                                    </Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text strong>Charged Amount:</Text>
                                    <Text strong className="text-blue-600">
                                        {formatCurrency(orderInfo.final_charged_amount)}
                                    </Text>
                                </div>
                            </div>
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
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(orderInfo, 'created_at') ? 'bg-blue-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Order Created</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {formatDate(getSafeValue(orderInfo, 'created_at'))}
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(orderInfo, 'payment_initiated_at') ? 'bg-orange-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Payment Initiated</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {getSafeValue(orderInfo, 'payment_initiated_at')
                                                ? formatDate(orderInfo.payment_initiated_at)
                                                : 'Pending'
                                            }
                                        </Text>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getSafeValue(orderInfo, 'payment_status') === 'paid' ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1">
                                        <Text strong className="block">Payment Status</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {orderInfo?.payment_status}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatBookingUI;