import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Statistic,
  Button,
  Avatar,
  Tag,
  Typography,
  Badge,
  Modal,
  Descriptions,
  Divider,
  Menu,
  Dropdown,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined as TimeIcon,
  MoreOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getEventOrderDetailsDate,
  getEventOrderDetailsTime,
} from "store/slices/ordersSlice";
import HorizontalDateTimePicker from "components/util-components/DatePicker/HorizontalDateTimePicker";
import EventInformation from "../components/EventInformation";
import { IoTicketOutline } from "react-icons/io5";
import UserOrderDetailsModal from "../components/UserOrderDetailsModal";

const { Title, Text } = Typography;

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [selectedTimeId, setSelectedTimeId] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Refs to prevent duplicate calls
  const isDateChanging = useRef(false);
  const isTimeChanging = useRef(false);

  const {
    ordersDates,
    ordersTime,
    bookingTicketUser,
    bookingTickets,
    loading,
  } = useSelector((state) => state.orderSlice);

  // Sequential fetching methods similar to BookingPage
  const fetchInitialDates = useCallback(() => {
    if (!id || isInitialized) return;

    console.log("Fetching initial dates for schedule:", id);
    dispatch(getEventOrderDetailsDate({ schedule_id: id }));
  }, [dispatch, id, isInitialized]);

  const fetchTimeSlotsForDate = useCallback(
    (dateId, shouldAutoSelectTime = true) => {
      if (!dateId || isDateChanging.current) return;

      console.log("Fetching time slots for date:", dateId);
      isDateChanging.current = true;

      // Reset time selection when date changes
      setSelectedTimeId(null);
      setPagination({ current: 1, pageSize: pagination.pageSize });

      dispatch(
        getEventOrderDetailsTime({
          schedule_id: id,
          show_date_id: dateId,
        })
      )
        .then((response) => {
          isDateChanging.current = false;

          // Auto-select first time slot if requested and available
          if (shouldAutoSelectTime && response.payload?.length > 0) {
            const firstTimeId = response.payload[0].id;
            console.log("Auto-selecting first time slot:", firstTimeId);
            setSelectedTimeId(firstTimeId);
            fetchBookingUsersForTime(
              dateId,
              firstTimeId,
              1,
              pagination.pageSize
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching time slots:", error);
          isDateChanging.current = false;
        });
    },
    [dispatch, id, pagination.pageSize]
  );

  const fetchBookingUsersForTime = useCallback(
    (dateId, timeId, page = 1, size = 10) => {
      if (!dateId || !timeId || isTimeChanging.current) {
        console.warn(
          "Missing parameters or time is changing, skipping fetchBookingUsers"
        );
        return;
      }

      console.log("Fetching booking users:", { dateId, timeId, page, size });
      isTimeChanging.current = true;

      dispatch(
        getEventOrderDetailsTime({
          schedule_id: id,
          show_date_id: dateId,
          show_time_id: timeId,
          page: page,
          size: size,
        })
      )
        .then(() => {
          isTimeChanging.current = false;
        })
        .catch((error) => {
          console.error("Error fetching booking users:", error);
          isTimeChanging.current = false;
        });
    },
    [dispatch, id]
  );

  // Initialize component - fetch dates first
  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }

    if (!isInitialized) {
      fetchInitialDates();
    }
  }, [id, navigate, fetchInitialDates, isInitialized]);

  // Handle dates loaded - auto-select first date
  useEffect(() => {
    if (
      ordersDates &&
      ordersDates.length > 0 &&
      !selectedDateId &&
      !isInitialized
    ) {
      const firstDateId = ordersDates[0].id;
      console.log("Auto-selecting first date:", firstDateId);
      setSelectedDateId(firstDateId);
      setIsInitialized(true);
      fetchTimeSlotsForDate(firstDateId, true);
    }
  }, [ordersDates, selectedDateId, isInitialized, fetchTimeSlotsForDate]);

  // Event handlers
  const handleDateChange = useCallback(
    (dateId) => {
      if (dateId === selectedDateId || isDateChanging.current) {
        console.log("Same date selected or date is changing, ignoring");
        return;
      }

      console.log("Date manually changed to:", dateId);
      setSelectedDateId(dateId);
      fetchTimeSlotsForDate(dateId, true);
    },
    [selectedDateId, fetchTimeSlotsForDate]
  );

  const handleTimeChange = useCallback(
    (timeId) => {
      if (timeId === selectedTimeId || isTimeChanging.current) {
        console.log("Same time selected or time is changing, ignoring");
        return;
      }

      console.log("Time manually changed to:", timeId);
      setSelectedTimeId(timeId);
      setPagination({ current: 1, pageSize: pagination.pageSize });
      fetchBookingUsersForTime(selectedDateId, timeId, 1, pagination.pageSize);
    },
    [
      selectedTimeId,
      selectedDateId,
      pagination.pageSize,
      fetchBookingUsersForTime,
    ]
  );

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (page, pageSize) => {
      const newPagination = {
        current: page,
        pageSize: pageSize,
      };
      setPagination(newPagination);
      fetchBookingUsersForTime(selectedDateId, selectedTimeId, page, pageSize);
    },
    [selectedDateId, selectedTimeId, fetchBookingUsersForTime]
  );

  // Get current statistics
  const getCurrentStats = useCallback(() => {
    if (bookingTicketUser && bookingTicketUser.booking_ticket_user) {
      return {
        total_bookings: bookingTicketUser.total_bookings || 0,
        success_bookings: bookingTicketUser.success_bookings || 0,
        failed_bookings: bookingTicketUser.failed_bookings || 0,
        pending_bookings: bookingTicketUser.pending_bookings || 0,
      };
    }
    if (ordersTime && ordersTime.length > 0) {
      return {
        total_bookings: ordersTime[0].total_bookings || 0,
        success_bookings: ordersTime[0].success_bookings || 0,
        failed_bookings: ordersTime[0].failed_bookings || 0,
        pending_bookings: ordersTime[0].pending_bookings || 0,
      };
    }
    return {
      total_bookings: 0,
      success_bookings: 0,
      failed_bookings: 0,
      pending_bookings: 0,
    };
  }, [bookingTicketUser, ordersTime]);

  // Handle user selection
  const handleUserSelect = useCallback(
    (userId) => {
      setSelectedUserId(userId);
      setUserModal(true);
      dispatch(
        getEventOrderDetailsTime({
          schedule_id: id,
          show_date_id: selectedDateId,
          show_time_id: selectedTimeId,
          user_id: userId,
        })
      );
    },
    [dispatch, id, selectedDateId, selectedTimeId]
  );

  const handleBackToList = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleModalClose = useCallback(() => {
    setUserModal(false);
    setSelectedUserId(null);
  }, []);

  const handleCheckStatus = () => {
    message.loading({ content: "Checking Payment Status...", duration: 2 });

    setTimeout(() => {
      message.warning("Checking Status API is not completed");
    }, 2000);
  };

  const bookingColumns = [
    {
      title: "Customer Details",
      dataIndex: "username",
      width: 250,
      render: (name, record) => (
        <div className="customer-info">
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ marginRight: 8, backgroundColor: "#1890ff" }}
            />
            <Text strong>{name || "N/A"}</Text>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginLeft: 24 }}>
            <div>{record.email || "N/A"}</div>
            <div>{record.phone_number || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phone_number",
      width: 120,
      render: (phone, record) => (
        <div>
          <Tag color="blue" style={{ marginBottom: 4 }}>
            {phone || "N/A"}
          </Tag>
          <div style={{ fontSize: "11px", color: "#999" }}>ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Booking Stats",
      dataIndex: "total_bookings",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue">
              <IoTicketOutline /> {record.total_bookings || 0} Bookings
            </Tag>
          </div>
          <div>
            <Tag color="green">
              <TeamOutlined /> {record.total_items_booked || 0} Items
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "success_bookings",
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <Badge
              status="success"
              text={`${record.success_bookings || 0} Success`}
              style={{ fontSize: "11px" }}
            />
          </div>
          <div style={{ marginBottom: 2 }}>
            <Badge
              status="error"
              text={`${record.failed_bookings || 0} Failed`}
              style={{ fontSize: "11px" }}
            />
          </div>
          <div>
            <Badge
              status="processing"
              text={`${record.pending_bookings || 0} Pending`}
              style={{ fontSize: "11px" }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
      render: (email) => (
        <Text style={{ fontSize: "12px" }}>{email || "N/A"}</Text>
      ),
    },
    {
      title: "Action",
      dataIndex: "id",
      width: 100,
      render: (userId, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" onClick={() => handleUserSelect(userId)}>
              View Details
            </Menu.Item>
            <Menu.Item
              key="email"
              onClick={() => {
                handleCheckStatus();
              }}
            >
              Check Payment Status
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <MoreOutlined />
          </Dropdown>
        );
      },
    },
  ];

  // Ticket columns (keeping your existing definition)
  const ticketColumns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      width: 100,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Ticket Details",
      dataIndex: "booking_items",
      render: (items) => (
        <div>
          {items?.map((item, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <div>
                <Text strong>{item.ticket_type?.name || "N/A"}</Text>
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {item.num_of_tickets} tickets
                </Tag>
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Price: ₹{item.ticket_type?.price || 0} each
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Total: ₹
                {(item.ticket_type?.price || 0) * (item.num_of_tickets || 0)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Show Details",
      dataIndex: "booking_items",
      render: (items) => (
        <div>
          {items?.map((item, index) => (
            <div key={index} style={{ fontSize: "12px" }}>
              <div>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {item.show_date?.start_date || "N/A"}
              </div>
              <div>
                <TimeIcon style={{ marginRight: 4 }} />
                {item.show_time?.start_time || "N/A"} -{" "}
                {item.show_time?.end_time || "N/A"}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount, record) => (
        <div>
          <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
            ₹{amount || 0}
          </Text>
          {record.original_amount !== amount && (
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              ₹{record.original_amount}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "User Details",
      dataIndex: "user",
      width: 200,
      render: (user) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <Text strong>{user?.username || "N/A"}</Text>
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {user?.email || "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {user?.phone_number || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Booking Date",
      dataIndex: "created_at",
      render: (date) => (
        <Text style={{ fontSize: "12px" }}>
          {date ? new Date(date).toLocaleString() : "N/A"}
        </Text>
      ),
    },
  ];

  // Loading state
  if (loading && !ordersDates && !bookingTicketUser && !isInitialized) {
    return (
      <div style={{ padding: "24px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
          Back to Events List
        </Button>
        <Card style={{ marginTop: 16, textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "16px", color: "#666" }}>
            Loading event details...
          </div>
        </Card>
      </div>
    );
  }

  // Extract user list and pagination info with proper fallbacks
  const userList = bookingTicketUser?.booking_ticket_user?.items || [];
  const paginationInfo = bookingTicketUser?.booking_ticket_user || {
    total: 0,
    page: 1,
    size: 10,
    pages: 1,
  };
  const currentStats = getCurrentStats();
  const selectedUser = userList.find((user) => user.id === selectedUserId);

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToList}
          size="large"
        >
          Back to Events List
        </Button>
      </div>

      {/* Event Information - Show if available */}
      {ordersDates && ordersDates.length > 0 && (
        <EventInformation data={ordersDates[0]} />
      )}

      {/* Date and Time Picker - Show if dates are available */}
      {ordersDates && ordersDates.length > 0 && (
        <Card>
          <HorizontalDateTimePicker
            dates={ordersDates || []}
            times={ordersTime || []}
            selectedDateId={selectedDateId}
            selectedTimeId={selectedTimeId}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            loading={loading}
          />
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
            }}
          >
            <Statistic
              title="Total Bookings"
              value={currentStats.total_bookings || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
            }}
          >
            <Statistic
              title="Completed"
              value={currentStats.success_bookings || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
            }}
          >
            <Statistic
              title="Pending"
              value={currentStats.pending_bookings || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              textAlign: "center",
            }}
          >
            <Statistic
              title="Failed"
              value={currentStats.failed_bookings || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bookings Table */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              Bookings for Schedule {id}
            </Title>
            <Text style={{ fontSize: "14px", color: "#666" }}>
              {paginationInfo.total || 0} booking
              {(paginationInfo.total || 0) !== 1 ? "s" : ""} found
            </Text>
          </div>
        }
      >
        <Table
          dataSource={userList}
          rowKey="id"
          loading={loading}
          columns={bookingColumns}
          pagination={{
            current: paginationInfo.page || 1,
            pageSize: paginationInfo.size || 10,
            total: paginationInfo.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} bookings`,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      <UserOrderDetailsModal
        selectedUser={selectedUser}
        userModal={userModal}
        userBookings={bookingTickets}
        handleModalClose={handleModalClose}
        ticketColumns={ticketColumns}
      />
    </div>
  );
};

export default EventDetailsPage;
