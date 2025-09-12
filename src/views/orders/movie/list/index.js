import React, { useCallback, useEffect, useState } from "react";
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
import { getMovieOrders, getMovieOrderSummary } from "store/slices/ordersSlice";
import utils from "utils";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import {
  resetSearchValue,
  setGlobalSearchValue,
} from "store/slices/fliterSlice";
import { DEFAULT_PAGE_SIZE, EVENT_TYPES } from "constants/PageConstants";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { fetchAllEvent } from "store/slices/eventSlice";
import { debounce } from "lodash";
import { BOOKING_TYPE } from "constants/AppConstants";
import { fetchDropdownTheaters } from "store/slices/theaterSlice";

const { Search } = Input;
const { Option } = Select;

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State management
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE.size);

  const {
    eventOrdersDataList: eventOrdersData,
    eventOrderSummary,
    loading,
    pagination,
  } = useSelector((state) => state.orderSlice);
  const { response } = useSelector((state) => state.theater);
  // Initial data fetch
  useEffect(() => {
    dispatch(getMovieOrders(DEFAULT_PAGE_SIZE));
    dispatch(getMovieOrderSummary({}));
    dispatch(fetchDropdownTheaters(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  // Handle view details navigation
  const handleViewDetails = (schedule) => {
    navigate(
      `${APP_PREFIX_PATH}/reports/orders/movie/details/${schedule.id}?type=${
        schedule.available_types === "ticket_structure"
          ? BOOKING_TYPE.MOVIE_TICKET
          : BOOKING_TYPE.MOVIE_SEAT
      }`,
      {
        state: { schedule },
      }
    );
  };

  // Dropdown menu for actions
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

  // Table columns configuration
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
      title: "Theatre",
      dataIndex: ["theatre", "name"],
      key: "name",
      render: (name) => (
        <div style={{ fontWeight: "bold" }}>{name || "N/A"}</div>
      ),
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["theatre", "name"]),
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
              Pending: {record.processing_bookings}
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
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
      ),
    },
  ];

  // Handle event selection
  const handleSelectEvent = (theatreId) => {
    setSelectedEventId(theatreId);
    setCurrentPage(1); // Reset to first page when changing event
    setSearchTerm(""); // Clear search when changing event

    const params = {
      page: 1,
      size: pageSize,
      theatre_id: theatreId,
    };

    dispatch(getMovieOrders(params));
    dispatch(getMovieOrderSummary({ theatre_id: theatreId }));
  };

  // Handle event selection clear
  const handleClearEvent = () => {
    setSelectedEventId(null);
    setCurrentPage(1);
    setSearchTerm("");
    dispatch(getMovieOrders(DEFAULT_PAGE_SIZE));
    dispatch(getMovieOrderSummary({}));
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = {
        page: 1,
        size: pageSize,
        search: value,
        ...(selectedEventId && { theatre_id: selectedEventId }),
      };

      setCurrentPage(1);
      dispatch(getMovieOrders(params));
    }, 500),
    [dispatch, selectedEventId, pageSize]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      const params = {
        page: 1,
        size: pageSize,
        ...(selectedEventId && { theatre_id: selectedEventId }),
      };
      setCurrentPage(1);
      dispatch(getMovieOrders(params));
    } else {
      debouncedSearch(value);
    }
  };

  const handleSearchSubmit = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);

    const params = {
      page: 1,
      size: pageSize,
      search: value,
      ...(selectedEventId && { theatre_id: selectedEventId }),
    };

    dispatch(getMovieOrders(params));
  };

  const debouncedEventSearch = useCallback(
    debounce((value) => {
      dispatch(
        fetchDropdownTheaters({
          search: value,
        })
      );
    }, 500),
    [dispatch]
  );

  const handleEventSearch = (value) => {
    if (value && value.trim()) {
      debouncedEventSearch(value);
    } else {
      dispatch(fetchDropdownTheaters(DEFAULT_PAGE_SIZE));
    }
  };

  const handleTableChange = (paginationConfig) => {
    const newPage = paginationConfig.current;
    const newPageSize = paginationConfig.pageSize;

    setCurrentPage(newPage);

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }

    const params = {
      page: newPage,
      size: newPageSize,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedEventId && { theatre_id: selectedEventId }),
    };

    dispatch(getMovieOrders(params));
  };

  // Alternative: If you prefer to use the usePaginationHook
  const handlePagination = usePaginationHook(getMovieOrders);

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
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
              style={{ width: 200 }}
              allowClear
            />
          </div>
          <div className="mr-md-3 mb-3">
            <Select
              loading={loading}
              className="w-100"
              placeholder="Select an Theatre"
              value={selectedEventId}
              onChange={handleSelectEvent}
              onSearch={handleEventSearch}
              allowClear
              onClear={handleClearEvent}
              showArrow
              showSearch
              filterOption={false}
              style={{ minWidth: 200 }}
            >
              {response?.items?.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.name}
                </Option>
              ))}
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
              value={eventOrderSummary?.total_bookings ?? 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Bookings"
              value={eventOrderSummary?.success_bookings ?? 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Bookings"
              value={eventOrderSummary?.processing_bookings ?? 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed Bookings"
              value={eventOrderSummary?.failed_bookings ?? 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={eventOrdersData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.page || currentPage,
            pageSize: pagination?.size || pageSize,
            total: pagination?.total || 0,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
            onShowSizeChange: handleTableChange,
            showSizeChanger: true,

            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </div>
    </Card>
  );
};

export default OrdersList;
