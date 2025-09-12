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

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const BookingList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE.size);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);
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
                ...(selectedPaymentStatus && selectedPaymentStatus !== "ALL" && {
                    payment_status: selectedPaymentStatus,
                }),
                ...extraParams,
            })
        );
    };

    const handleViewDetails = (order) => {
        navigate(`${APP_PREFIX_PATH}/reports/orders/details/${order.id}`, {
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
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const tableColumns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (id) => (
                <div>
                    <Text strong>#{id}</Text>
                </div>
            ),
            sorter: (a, b) => a.id - b.id,
            width: 100,
        },
        {
            title: "Customer Details",
            key: "customer",
            render: (record) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                        <Text strong>{record?.user?.username || "Guest User"}</Text>
                    </div>
                    {record.email && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.email}
                        </div>
                    )}
                    {record.phone && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            📞 {record.phone}
                        </div>
                    )}
                </div>
            ),
            width: 200,
        },
        {
            title: "Event & Venue",
            key: "event_venue",
            render: (record) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <Text strong style={{ color: '#1890ff' }}>
                            {record.event?.event_name}
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#666' }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {record.venue?.name}
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
            ),
            width: 250,
        },
        {
            title: "Schedule",
            key: "schedule",
            render: (record) => {
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
            render: (record) => (
                <div>
                    <div style={{ marginBottom: 2 }}>
                        <Text strong style={{ color: '#1890ff' }}>
                            {(record.final_amount || record.amount || 0).toFixed(2)}
                        </Text>
                    </div>
                    {record.original_amount !== record.amount && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            Original: {record.original_amount?.toFixed(2)}
                        </div>
                    )}
                    {record.tax_amount && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            Tax: {record.tax_amount.toFixed(2)}
                        </div>
                    )}
                    {record.add_on_charge > 0 && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            Add-on: {record.add_on_charge.toFixed(2)}
                        </div>
                    )}
                </div>
            ),
            sorter: (a, b) => {
                const amountA = a.final_amount !== null && a.final_amount !== undefined
                    ? a.final_amount : a.amount;
                const amountB = b.final_amount !== null && b.final_amount !== undefined
                    ? b.final_amount : b.amount;
                return amountA - amountB;
            },
            width: 130,
        },
        {
            title: "Status & Features",
            key: "status_features",
            render: (record) => (
                <div>
                    <div style={{ marginBottom: 6 }}>
                        {getPaymentStatusTag(record.payment_status)}
                    </div>
                    <Space size={4}>
                        {record.qr_used && (
                            <Tooltip title="QR Code Used">
                                <Tag color="green" size="small">
                                    <QrcodeOutlined /> QR Used
                                </Tag>
                            </Tooltip>
                        )}
                        {record.coupon_code && (
                            <Tooltip title={`Coupon: ${record.coupon_code}`}>
                                <Tag color="purple" size="small">
                                    <TagOutlined /> Coupon
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                </div>
            ),
            width: 180,
        },
        {
            title: "Order Info",
            key: "order_info",
            render: (record) => {
                const createdDate = formatDate(record.created_at);
                const paymentDate = record.payment_initiated_at ? formatDate(record.payment_initiated_at) : null;

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
                        {record.order_reference && (
                            <Tooltip title={record.order_reference}>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Ref: {record.order_reference.substring(0, 8)}...
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchOrders(1, pageSize, { search: value });
    };

    const handleSelectPaymentStatus = (status) => {
        setSelectedPaymentStatus(status);
        setCurrentPage(1);
        fetchOrders(1, pageSize, {
            ...(status && status !== "ALL" && { payment_status: status }),
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
        fetchOrders(newPage, newPageSize);
    };

    useEffect(() => {
        if (pagination) {
            console.log("paginationcheck", pagination);
        }
    }, [pagination]);

    // Summary Cards
    const getSummaryData = () => {
        const totalOrders = ordersData.length;
        const paidOrders = ordersData.filter(order => order.payment_status === 'paid').length;
        const pendingOrders = ordersData.filter(order => order.payment_status === 'pending').length;
        const totalRevenue = ordersData
            .filter(order => order.payment_status === 'paid')
            .reduce((sum, order) => sum + (order.final_amount || order.amount || 0), 0);

        return { totalOrders, paidOrders, pendingOrders, totalRevenue };
    };

    const { totalOrders, paidOrders, pendingOrders, totalRevenue } = getSummaryData();

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
                            onShowSizeChange: (current, size) =>
                                handleTableChange({ current, pageSize: size }),
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`,
                        }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default BookingList;