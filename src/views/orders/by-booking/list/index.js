import React, { useCallback, useEffect, useState } from "react";
import {
    Card,
    Table,
    Input,
    Menu,
    Tag,
    Avatar,
    Select,
    Tooltip,
    Space,
    Typography,
    Button,
} from "antd";
import {
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    QrcodeOutlined,
    LinkOutlined,
    TagOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrderByBookings } from "store/slices/ordersSlice";
import utils from "utils";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { PAYMENT_STATUS_OPTIONS } from "constants/PaymentConstants";
import { debounce } from "lodash";
const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const BookingList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE.size);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
    const [selectedEventType, setSelectedEventType] = useState('ticket');

    const { ordersByBooking, loading, pagination } = useSelector(
        (state) => state.orderSlice
    );

    useEffect(() => {
        fetchOrders(1, pageSize);
    }, []);

    const fetchOrders = (page = currentPage, size = pageSize, extraParams = {}) => {
        dispatch(
            getOrderByBookings({
                page,
                size,
                type: selectedEventType || "ticket",
                ...(searchTerm && { search: searchTerm }),
                ...extraParams,
            })
        );
    };

    const handleViewDetails = (order) => {
        if (selectedEventType === 'seat') {
            console.log(order);
            navigate(`${APP_PREFIX_PATH}/reports/orders/by-booking/detail/${order.order_id}/${selectedEventType}?showSeatId=${order?.show_seat_details_id}`, {
                state: { order },
            });
            return;
        }
        navigate(`${APP_PREFIX_PATH}/reports/orders/by-booking/detail/${order.id}/${selectedEventType}`, {
            state: { order },
        });
    };

    const dropdownMenu = (row) => (
        <Menu>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewDetails(row)}>
                    <EyeOutlined />
                    <span className="ml-2">View Details</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const getPaymentStatusTag = (status) => {
        let color = "default";
        let icon = null;

        switch (status) {
            case "paid":
                color = "green";
                icon = <CheckCircleOutlined />;
                break;
            case "processing":
                color = "blue";
                icon = <ClockCircleOutlined />;
                break;
            case "pending":
                color = "orange";
                icon = <ClockCircleOutlined />;
                break;
            case "failed":
                color = "red";
                icon = <CloseCircleOutlined />;
                break;
            default:
                color = "default";
        }

        return (
            <Tag color={color} icon={icon}>
                {status?.toUpperCase()}
            </Tag>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Helper function to get order data based on structure type
    const getOrderData = (order) => {
        if (selectedEventType === 'seat') {
            return {
                ...order.order_data,
                id: order.order_id,
                created_at: order.created_at,
                order_reference: order.order_data?.order_reference || order.order_id
            };
        }
        return order;
    };

    // Helper function to get customer details based on structure type
    const getCustomerDetails = (order) => {
        const orderData = getOrderData(order);

        return {
            username: orderData.user?.username || "Guest User",
            email: orderData.email,
            phone: orderData.phone
        };
    };

    // Helper function to get amount details based on structure type
    const getAmountDetails = (order) => {
        const orderData = getOrderData(order);

        return {
            final_amount: orderData.final_amount || orderData.amount || 0,
            original_amount: orderData.original_amount,
            tax_amount: orderData.tax_amount,
            add_on_charge: orderData.add_on_charge || 0
        };
    };

    // Helper function to get payment details based on structure type
    const getPaymentDetails = (order) => {
        const orderData = getOrderData(order);

        return {
            payment_status: orderData.payment_status,
            qr_used: orderData.qr_used,
            coupon_code: orderData.coupon_code,
            payment_initiated_at: orderData.payment_initiated_at
        };
    };

    const tableColumns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (id, record) => {
                const orderData = getOrderData(record);
                return (
                    <div>
                        <Text strong>#{orderData.id || id}</Text>
                    </div>
                );
            },
            sorter: (a, b) => a.id - b.id,
            width: 200,
        },
        {
            title: "Customer Details",
            key: "customer",
            render: (record) => {
                const customer = getCustomerDetails(record);
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                            <Text strong>{customer.username}</Text>
                        </div>
                        {customer.email && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {customer.email}
                            </div>
                        )}
                        {customer.phone && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                📞 {customer.phone}
                            </div>
                        )}
                    </div>
                );
            },
            width: 200,
        },
        {
            title: "Event & Venue",
            key: "event_venue",
            render: (record) => {
                // For seat structure, we might not have event/venue details in the response
                if (selectedEventType === 'seat') {
                    return (
                        <div>
                            <div style={{ marginBottom: 4 }}>
                                <Text strong style={{ color: '#1890ff' }}>
                                    Seat Booking
                                </Text>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.show_seat_details_id ? `Show ID: ${record.show_seat_details_id}` : 'N/A'}
                            </div>
                        </div>
                    );
                }

                return (
                    <div>
                        <div style={{ marginBottom: 4 }}>
                            <Text strong style={{ color: '#1890ff' }}>
                                {record.event?.event_name || 'N/A'}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#666' }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {record.venue?.name || 'N/A'}
                        </div>
                        {record.event?.description && (
                            <Tooltip title={record.event.description}>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                                    {record.event.description.length > 50
                                        ? `${record.event.description.substring(0, 50)}...`
                                        : record.event.description}
                                </div>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            width: 250,
        },
        {
            title: "Schedule",
            key: "schedule",
            render: (record) => {
                if (selectedEventType === 'seat') {
                    const createdDate = formatDate(record.created_at);
                    return (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                <Text style={{ fontSize: '12px' }}>Booked: {createdDate.date}</Text>
                            </div>
                        </div>
                    );
                }

                const startDate = formatDate(record.schedules?.start_date);
                const endDate = formatDate(record.schedules?.end_date);

                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                            <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                            <Text style={{ fontSize: '12px' }}>Start: {startDate.date}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarOutlined style={{ marginRight: 4, color: '#f5222d' }} />
                            <Text style={{ fontSize: '12px' }}>End: {endDate.date}</Text>
                        </div>
                    </div>
                );
            },
            width: 150,
        },
        {
            title: "Amount Details",
            key: "amount_details",
            render: (record) => {
                const amounts = getAmountDetails(record);
                return (
                    <div>
                        <div style={{ marginBottom: 2 }}>
                            <Text strong style={{ color: '#1890ff' }}>
                                {amounts.final_amount.toFixed(2)}
                            </Text>
                        </div>
                        {amounts.original_amount !== amounts.final_amount && (
                            <div style={{ fontSize: '11px', color: '#666' }}>
                                Original: {amounts.original_amount?.toFixed(2) || amounts.final_amount.toFixed(2)}
                            </div>
                        )}
                        {amounts.tax_amount && (
                            <div style={{ fontSize: '11px', color: '#666' }}>
                                Tax: {amounts.tax_amount.toFixed(2)}
                            </div>
                        )}
                        {amounts.add_on_charge > 0 && (
                            <div style={{ fontSize: '11px', color: '#666' }}>
                                Add-on: {amounts.add_on_charge.toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => {
                const amountA = getAmountDetails(a).final_amount;
                const amountB = getAmountDetails(b).final_amount;
                return amountA - amountB;
            },
            width: 130,
        },
        {
            title: "Status & Features",
            key: "status_features",
            render: (record) => {
                const paymentDetails = getPaymentDetails(record);
                return (
                    <div>
                        <div style={{ marginBottom: 6 }}>
                            {getPaymentStatusTag(paymentDetails.payment_status)}
                        </div>
                        <Space size={4}>
                            {paymentDetails.qr_used && (
                                <Tooltip title="QR Code Used">
                                    <Tag color="green" size="small">
                                        <QrcodeOutlined /> QR Used
                                    </Tag>
                                </Tooltip>
                            )}
                            {paymentDetails.coupon_code && (
                                <Tooltip title={`Coupon: ${paymentDetails.coupon_code}`}>
                                    <Tag color="purple" size="small">
                                        <TagOutlined /> Coupon
                                    </Tag>
                                </Tooltip>
                            )}
                            {selectedEventType === 'seat' && record.order_data?.seats && (
                                <Tooltip title={`${record.order_data.seats.length} seat(s) booked`}>
                                    <Tag color="blue" size="small">
                                        {record.order_data.seats.length} Seat(s)
                                    </Tag>
                                </Tooltip>
                            )}
                        </Space>
                    </div>
                );
            },
            width: 180,
        },
        {
            title: "Order Info",
            key: "order_info",
            render: (record) => {
                const orderData = getOrderData(record);
                const createdDate = formatDate(orderData.created_at);
                const paymentDate = orderData.payment_initiated_at ? formatDate(orderData.payment_initiated_at) : null;

                return (
                    <div>
                        <div style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                Created: {createdDate.date}
                            </Text>
                        </div>
                        {paymentDate && (
                            <div style={{ marginBottom: 4 }}>
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Paid: {paymentDate.date}
                                </Text>
                            </div>
                        )}
                        {orderData.order_reference && (
                            <Tooltip title={orderData.order_reference}>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Ref: {orderData.order_reference.substring(0, 8)}...
                                </div>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            width: 130,
        },
        {
            title: "",
            dataIndex: "actions",
            render: (_, elm) => (
                <div className="text-right">
                    <EllipsisDropdown menu={dropdownMenu(elm)} />
                </div>
            ),
            width: 50,
        },
    ];

    const ordersData = ordersByBooking?.items || [];

    const debouncedFetch = useCallback(
        debounce((value) => {
            setCurrentPage(1);
            fetchOrders(1, pageSize, value ? { search: value } : {});
        }, 500),
        [pageSize, selectedEventType, selectedPaymentStatus]
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedFetch(value);
    };

    const handleSearchSubmit = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchOrders(1, pageSize, value ? { search: value } : {});
    };

    const handleSelectPaymentStatus = (status) => {
        setSelectedPaymentStatus(status);
        setCurrentPage(1);
        fetchOrders(1, pageSize, {
            ...(status && status !== "all" ? { status } : {}),
        });
    };

    const handleSelectEventType = (type) => {
        setSelectedEventType(type);
        setCurrentPage(1);
        fetchOrders(1, pageSize, { type });
    };

    const handleTableChange = (paginationConfig) => {
        const newPage = paginationConfig.current;
        const newPageSize = paginationConfig.pageSize;

        setCurrentPage(newPage);
        setPageSize(newPageSize);

        fetchOrders(newPage, newPageSize, {
            ...(selectedPaymentStatus && selectedPaymentStatus !== "all"
                ? { status: selectedPaymentStatus }
                : {}),
            ...(selectedEventType ? { type: selectedEventType } : {}),
            ...(searchTerm ? { search: searchTerm } : {}),
        });
    };

    const handleClearAllFilters = () => {
        const resetPage = 1;
        const resetSearch = "";
        const resetStatus = "all";
        const resetType = "ticket";

        setSearchTerm(resetSearch);
        setSelectedPaymentStatus(resetStatus);
        setSelectedEventType(resetType);
        setCurrentPage(resetPage);

        dispatch(
            getOrderByBookings({
                page: resetPage,
                size: pageSize,
                type: resetType,
            })
        );
    };

    return (
        <div>
            <Card>
                <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
                    <Flex className="mb-1" mobileFlex={false}>
                        {/* Search */}
                        <div className="mr-md-3 mb-3">
                            <Search
                                placeholder="Search Orders by ID"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onSearch={handleSearchSubmit}
                                style={{ width: 200 }}
                                allowClear
                            />
                        </div>

                        {/* Payment Status Filter */}
                        <div className="mr-md-3 mb-3">
                            <Select
                                className="w-100"
                                placeholder="Choose a payment status"
                                value={selectedPaymentStatus}
                                onChange={handleSelectPaymentStatus}
                                style={{ minWidth: 200 }}
                            >
                                {PAYMENT_STATUS_OPTIONS.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Event Type Filter */}
                        <div className="mr-md-3 mb-3">
                            <Select
                                className="w-100"
                                placeholder="Select event type"
                                value={selectedEventType}
                                onChange={handleSelectEventType}
                                style={{ minWidth: 200 }}
                            >
                                <Option value="ticket">Ticket Structure</Option>
                                <Option value="seat">Seat Structure</Option>
                            </Select>
                        </div>

                        <div className="mb-3">
                            <Button onClick={handleClearAllFilters}>Clear</Button>
                        </div>
                    </Flex>
                </Flex>

                {/* Table */}
                <div className="table-responsive">
                    <Table
                        columns={tableColumns}
                        dataSource={ordersData}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 1400 }}
                        pagination={{
                            current: pagination?.page || currentPage,
                            pageSize: pagination?.size || pageSize,
                            total: pagination?.total || 0,
                            onChange: (page, size) => handleTableChange({ current: page, pageSize: size }),
                            showSizeChanger: true,
                            onShowSizeChange: (current, size) => {
                                setCurrentPage(1);
                                setPageSize(size);
                                fetchOrders(1, size);
                            },
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default BookingList;