import React, { useCallback, useEffect, useState } from "react";
import {
    Card,
    Table,
    Input,
    Menu,
    Tag,
    Avatar,
    Select,
} from "antd";
import {
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrderByBookings } from "store/slices/ordersSlice";
import utils from "utils";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { debounce } from "lodash";
import { PAYMENT_STATUS_OPTIONS } from "constants/PaymentConstants";

const { Search } = Input;
const { Option } = Select;

const BookingList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE.size);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('paid');
    const [selectedEventType, setSelectedEventType] = useState(null);

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
                    status: selectedPaymentStatus,
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

    const tableColumns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (id) => `#${id}`,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Customer",
            dataIndex: "email",
            key: "email",
            render: (email, record) => (
                <div>
                    <div style={{ fontWeight: "bold" }}>{email || "Guest User"}</div>
                    {record.phone && <div>{record.phone}</div>}
                </div>
            ),
            sorter: (a, b) => utils.antdTableSorter(a, b, "email"),
        },
        {
            title: "Event",
            dataIndex: "event_id",
            key: "event_id",
            render: (eventId) => (
                <div style={{ fontWeight: "bold" }}>Event #{eventId}</div>
            ),
        },
        {
            title: "Schedule",
            dataIndex: "schedule_id",
            key: "schedule_id",
            render: (scheduleId) => <div>Schedule #{scheduleId}</div>,
        },
        {
            title: "Amount",
            dataIndex: "final_amount",
            key: "final_amount",
            render: (amount, record) => (
                <div>
                    {amount !== null && amount !== undefined
                        ? `${amount.toFixed(2)}`
                        : record.amount
                            ? `${record.amount.toFixed(2)}`
                            : "N/A"}
                </div>
            ),
            sorter: (a, b) => {
                const amountA =
                    a.final_amount !== null && a.final_amount !== undefined
                        ? a.final_amount
                        : a.amount;
                const amountB =
                    b.final_amount !== null && b.final_amount !== undefined
                        ? b.final_amount
                        : b.amount;
                return amountA - amountB;
            },
        },
        {
            title: "Payment Status",
            dataIndex: "payment_status",
            key: "payment_status",
            render: (status) => getPaymentStatusTag(status),
            sorter: (a, b) => utils.antdTableSorter(a, b, "payment_status"),
        },
        {
            title: "Order Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(date).toLocaleDateString()}
                </div>
            ),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: "",
            dataIndex: "actions",
            render: (_, elm) => (
                <div className="text-right">
                    <EllipsisDropdown menu={dropdownMenu(elm)} />
                </div>
            ),
        },
    ];

    const ordersData = ordersByBooking?.items || [];

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setCurrentPage(1);
            fetchOrders(1, pageSize, { search: value });
        }, 500),
        [pageSize, selectedEventType, selectedPaymentStatus]
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (!value.trim()) {
            fetchOrders(1, pageSize);
        } else {
            debouncedSearch(value);
        }
    };

    const handleSearchSubmit = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchOrders(1, pageSize, { search: value });
    };
    const handleSelectPaymentStatus = (status) => {
        setSelectedPaymentStatus(status);
        fetchOrders(currentPage, pageSize, {
            ...(status && status !== "ALL" && { status: status }),
        });
    };

    const handleSelectEventType = (type) => {
        setSelectedEventType(type);
        fetchOrders(currentPage, pageSize, { type });
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
            console.log("paginationcheck", pagination)
        }
    }, [pagination])

    return (
        <Card>
            <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
                <Flex className="mb-1" mobileFlex={false}>
                    {/* Search */}
                    <div className="mr-md-3 mb-3">
                        <Search
                            placeholder="Search Orders by Id"
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
                            allowClear
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
                            allowClear
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
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: pagination.total,
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
    );
};

export default BookingList;
