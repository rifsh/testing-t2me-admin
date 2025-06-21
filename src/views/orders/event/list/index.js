import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Menu,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Avatar,
  Select,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fethEventOrders } from "store/slices/ordersSlice";
import utils from "utils";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import {
  resetSearchValue,
  setGlobalSearchValue,
} from "store/slices/fliterSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const { Search } = Input;
const { Option } = Select;

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState(null);
  const {
    eventOrdersDataList: eventOrdersData,

    loading,
    pagination,
  } = useSelector((state) => state.orderSlice);

  useEffect(() => {
    dispatch(fethEventOrders(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handleViewDetails = (schedule) => {
    navigate(`${APP_PREFIX_PATH}/reports/orders/event/details/${schedule.id}`, {
      state: { schedule },
    });
  };
  const handlePagination = usePaginationHook(fethEventOrders);
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

  const tableColumns = [
    {
      title: "Schedule",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={record.event?.thumbnail_image}
            size={40}
            style={{ marginRight: 12 }}
            icon={<CalendarOutlined />}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{name || "N/A"}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Event",
      dataIndex: ["event", "event_name"],
      key: "event_name",
      render: (event_name) => (
        <div style={{ fontWeight: "bold" }}>{event_name || "N/A"}</div>
      ),
      sorter: (a, b) =>
        utils.antdTableObjectSorter(a, b, ["event", "event_name"]),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: "Total Bookings",
      dataIndex: "total_bookings",
      key: "total_bookings",
      render: (total) => (
        <Badge count={total} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
      sorter: (a, b) => a.total_bookings - b.total_bookings,
    },
    {
      title: "Booking Status",
      key: "booking_status",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#52c41a" }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              Success: {record.success_bookings}
            </span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#faad14" }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              Pending: {record.pending_bookings}
            </span>
          </div>
          <div>
            <span style={{ color: "#ff4d4f" }}>
              <CloseCircleOutlined style={{ marginRight: 4 }} />
              Failed: {record.failed_bookings}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Available Types",
      dataIndex: "available_types",
      key: "available_types",
      render: (types) => <Tag color="blue">{types || "N/A"}</Tag>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "available_types"),
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

  const handleSearch = (value) => {
    if (value) {
      setSearchTerm(value);
      dispatch(setGlobalSearchValue(value));
      dispatch(
        fethEventOrders({
          search: value,
          page: 1,
          size: DEFAULT_PAGE_SIZE.size,
          status: activeStatus,
        })
      );
    }
  };

  const handleSearchIsEmpty = (value) => {
    if (!value) {
      setSearchTerm("");
      dispatch(resetSearchValue());
      dispatch(
        fethEventOrders({
          search: null,
          page: 1,
          size: DEFAULT_PAGE_SIZE.size,
          status: activeStatus,
        })
      );
    }
  };

  const handleShowStatus = (status) => {
    setActiveStatus(status);
    dispatch(
      fethEventOrders({
        search: searchTerm,
        page: 1,
        size: DEFAULT_PAGE_SIZE.size,
        status,
      })
    );
  };

  const handleTableChange = (pagination) => {
    dispatch(
      fethEventOrders({
        page: pagination.current,
        size: pagination.pageSize,
        search: searchTerm,
        status: activeStatus,
      })
    );
  };

  // Calculate total statistics
  const totalStats = eventOrdersData.reduce(
    (acc, schedule) => ({
      totalBookings: acc.totalBookings + (schedule.total_bookings || 0),
      successBookings: acc.successBookings + (schedule.success_bookings || 0),
      pendingBookings: acc.pendingBookings + (schedule.pending_bookings || 0),
      failedBookings: acc.failedBookings + (schedule.failed_bookings || 0),
    }),
    {
      totalBookings: 0,
      successBookings: 0,
      pendingBookings: 0,
      failedBookings: 0,
    }
  );

  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Search
              placeholder="Search Schedules"
              onChange={(e) => handleSearchIsEmpty(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              onChange={handleShowStatus}
              className="mr-2"
            >
              <Option value={null}>All</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </div>
        </Flex>
      </Flex>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={totalStats.totalBookings}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Bookings"
              value={totalStats.successBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Bookings"
              value={totalStats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed Bookings"
              value={totalStats.failedBookings}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={eventOrdersData}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
        />
      </div>
    </Card>
  );
};

export default OrdersList;
