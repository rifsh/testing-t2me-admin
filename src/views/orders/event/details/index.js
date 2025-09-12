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
  MoreOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearTicketUser,
  clearTimes,
  clearUserData,
  getEventOrderDetailsDate,
  getEventOrderDetailsTime,
  resetOrderDetails,
} from "store/slices/ordersSlice";
import HorizontalDateTimePicker from "components/util-components/DatePicker/HorizontalDateTimePicker";
import EventInformation from "../components/EventInformation";
import { IoTicketOutline } from "react-icons/io5";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { BOOKING_TYPE } from "constants/AppConstants";

const { Title, Text } = Typography;

const EventDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedDateId, setSelectedDateId] = useState(null);
  const [selectedTimeId, setSelectedTimeId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const isDateChanging = useRef(false);
  const isTimeChanging = useRef(false);

  const { ordersDates, ordersTime, allOrdersTime, bookingTicketUser, loading } =
    useSelector((state) => state.orderSlice);

  useEffect(() => {
    return () => {
      dispatch(resetOrderDetails());
      dispatch(clearTimes());
      dispatch(clearUserData());
      dispatch(clearTicketUser());
      setSelectedDateId(null);
      setSelectedTimeId(null);
      setPagination({ current: 1, pageSize: 10 });
      setIsInitialized(false);
      isDateChanging.current = false;
      isTimeChanging.current = false;
    };
  }, [id]);

  const resetState = useCallback(() => {
    setSelectedDateId(null);
    setSelectedTimeId(null);
    setPagination({ current: 1, pageSize: 10 });
    setIsInitialized(false);
    isDateChanging.current = false;
    isTimeChanging.current = false;
  }, []);

  const fetchInitialDates = useCallback(async () => {
    if (!id) return;

    resetState();

    try {
      const response = await dispatch(
        getEventOrderDetailsDate({ schedule_id: id })
      );
      console.log("Dates fetched:", response.payload);
      return response.payload;
    } catch (error) {
      console.error("Error fetching dates:", error);
      return [];
    }
  }, [dispatch, id, resetState]);

  const fetchTimeSlotsForDate = useCallback(
    async (dateId, shouldAutoSelectTime = true) => {
      if (!dateId || isDateChanging.current) {
        console.log(
          "Skipping time fetch - dateId:",
          dateId,
          "isChanging:",
          isDateChanging.current
        );
        return;
      }

      console.log("Fetching time slots for date:", dateId);
      isDateChanging.current = true;

      // Only reset time selection if we're changing dates
      if (dateId !== selectedDateId) {
        setSelectedTimeId(null);
        setPagination({ current: 1, pageSize: pagination.pageSize });
      }
      dispatch(clearTimes());
      const apiParams = {
        schedule_id: id,
        ...(type === BOOKING_TYPE.EVENT_TICKET
          ? { show_date_id: dateId }
          : { start_date: dateId }),
      };

      console.log("Time API params:", apiParams);

      try {
        const response = await dispatch(getEventOrderDetailsTime(apiParams));
        console.log("Time slots response:", response.payload);

        if (shouldAutoSelectTime && response.payload?.length > 0) {
          const firstTimeId = response.payload[0].id;
          console.log("Auto-selecting first time slot:", firstTimeId);
          setSelectedTimeId(firstTimeId);

          // Fetch booking users for the first time slot
          await fetchBookingUsersForTime(
            dateId,
            firstTimeId,
            1,
            pagination.pageSize
          );
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
      } finally {
        isDateChanging.current = false;
      }
    },
    [dispatch, id, pagination.pageSize, type, selectedDateId]
  );

  const fetchBookingUsersForTime = useCallback(
    async (dateId, timeId, page = 1, size = 10) => {
      if (!dateId || !timeId || isTimeChanging.current) {
        console.log(
          "Skipping booking users fetch - dateId:",
          dateId,
          "timeId:",
          timeId,
          "isChanging:",
          isTimeChanging.current
        );
        return;
      }

      console.log("Fetching booking users for:", {
        dateId,
        timeId,
        page,
        size,
      });
      isTimeChanging.current = true;
      dispatch(clearTicketUser());
      const apiParams = {
        schedule_id: id,
        ...(type === BOOKING_TYPE.EVENT_TICKET
          ? { show_date_id: dateId }
          : { start_date: dateId }),
        show_time_id: timeId,
        page: page,
        size: size,
      };

      console.log("Booking users API params:", apiParams);

      try {
        const response = await dispatch(getEventOrderDetailsTime(apiParams));
        console.log("Booking users response:", response.payload);
      } catch (error) {
        console.error("Error fetching booking users:", error);
      } finally {
        isTimeChanging.current = false;
      }
    },
    [dispatch, id, type]
  );

  // Initial load effect
  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }

    if (!isInitialized) {
      console.log("Initializing component for ID:", id);
      fetchInitialDates();
    }
  }, [id, navigate, fetchInitialDates, isInitialized]);

  // Handle initial date selection when dates are loaded
  useEffect(() => {
    if (ordersDates?.length > 0 && !selectedDateId && !isInitialized) {
      console.log(
        "Setting up initial date selection from ordersDates:",
        ordersDates
      );

      const firstDate = ordersDates[0];
      const dateIdentifier =
        type === BOOKING_TYPE.EVENT_TICKET
          ? firstDate.id
          : firstDate.start_date;

      console.log("First date identifier:", dateIdentifier, "Type:", type);

      setSelectedDateId(dateIdentifier);
      setIsInitialized(true);

      // Fetch time slots for the first date
      fetchTimeSlotsForDate(dateIdentifier, true);
    }
  }, [ordersDates, selectedDateId, isInitialized, fetchTimeSlotsForDate, type]);

  const handleDateChange = useCallback(
    (date) => {
      console.log("Date change requested:", date, "Current:", selectedDateId);

      if (date === selectedDateId || isDateChanging.current) {
        console.log("Skipping date change - same date or already changing");
        return;
      }

      console.log("Changing date to:", date);
      setSelectedDateId(date);
      fetchTimeSlotsForDate(date, true);
    },
    [selectedDateId, fetchTimeSlotsForDate]
  );

  const handleTimeChange = useCallback(
    (timeId) => {
      console.log("Time change requested:", timeId, "Current:", selectedTimeId);

      if (timeId === selectedTimeId || isTimeChanging.current) {
        console.log("Skipping time change - same time or already changing");
        return;
      }

      console.log("Changing time to:", timeId);
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

  const handlePaginationChange = useCallback(
    (page, pageSize) => {
      console.log("Pagination change:", { page, pageSize });
      setPagination({ current: page, pageSize });
      fetchBookingUsersForTime(selectedDateId, selectedTimeId, page, pageSize);
    },
    [selectedDateId, selectedTimeId, fetchBookingUsersForTime]
  );

  const getBookingStats = useCallback(() => {
    if (bookingTicketUser) {
      return {
        total: bookingTicketUser.total_bookings || 0,
        success: bookingTicketUser.success_bookings || 0,
        failed: bookingTicketUser.failed_bookings || 0,
        pending: bookingTicketUser.processing_bookings || 0,
      };
    }
    if (ordersTime?.length > 0) {
      return {
        total: ordersTime[0].total_bookings || 0,
        success: ordersTime[0].success_bookings || 0,
        failed: ordersTime[0].failed_bookings || 0,
        pending: ordersTime[0].processing_bookings || 0,
      };
    }
    return { total: 0, success: 0, failed: 0, pending: 0 };
  }, [bookingTicketUser, ordersTime]);

  const getUserListData = () => {
    if (!bookingTicketUser) return { userList: [], paginationInfo: {} };

    if (type === BOOKING_TYPE.EVENT_TICKET) {
      return {
        userList: bookingTicketUser.booking_ticket_user?.items || [],
        paginationInfo: bookingTicketUser.booking_ticket_user || {
          total: 0,
          page: 1,
          size: 10,
          pages: 1,
        },
      };
    } else {
      console.log("Non-ticket booking data:", bookingTicketUser);
      return {
        userList: bookingTicketUser.seat_state?.permanent_bookings?.items || [],
        paginationInfo: bookingTicketUser.seat_state?.permanent_bookings || {
          total: 0,
          page: 1,
          size: 10,
          pages: 1,
        },
      };
    }
  };

  const handleUserSelect = (userId) => {
    navigate(
      `${APP_PREFIX_PATH}/reports/orders/event/user/details/${id}/${selectedDateId}/${selectedTimeId}/${userId}?type=${type}`
    );
  };

  const handleBackToList = useCallback(() => navigate(-1), [navigate]);

  const handleCheckStatus = () => {
    message.loading({ content: "Checking Payment Status...", duration: 2 });
    setTimeout(() => message.warning("Status check API not implemented"), 2000);
  };

  const bookingColumns = [
    {
      title: "Customer Details",
      dataIndex: ["user", "username"],
      width: 250,
      render: (name, record) => (
        <div className="customer-info">
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={`${CDN_PATH}/${record?.user?.thumbnail_image}`}
              style={{ marginRight: 8, backgroundColor: "#1890ff" }}
            />
            <Text strong>{name || "N/A"}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: ["user", "phone_number"],
      width: 120,
      render: (phone, record) => (
        <div>
          <Tag color="blue" style={{ marginBottom: 4 }}>
            {phone || "N/A"}
          </Tag>
          <div style={{ fontSize: "11px", color: "#999" }}>
            ID: {record.user?.id}
          </div>
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
<<<<<<< Updated upstream
              text={`${record.pending_bookings || 0} Processing`}
=======
              text={`${record.processing_bookings || 0} Pending`}
>>>>>>> Stashed changes
              style={{ fontSize: "11px" }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      width: 200,
      render: (email) => (
        <Text style={{ fontSize: "12px" }}>{email || "N/A"}</Text>
      ),
    },
    {
      title: "Action",
      dataIndex: ["user", "id"],
      width: 100,
      render: (userId) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" onClick={() => handleUserSelect(userId)}>
              View Details
            </Menu.Item>
            <Menu.Item key="email" onClick={handleCheckStatus}>
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

  // Debug logging
  console.log("Current state:", {
    selectedDateId,
    selectedTimeId,
    ordersDates: ordersDates?.length,
    ordersTime: ordersTime?.length,
    isInitialized,
    loading,
  });

  if (loading && !ordersDates && !bookingTicketUser) {
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

  const { userList, paginationInfo } = getUserListData();
  const stats = getBookingStats();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToList}
          size="large"
        >
          Back to Events List
        </Button>
      </div>

      {ordersDates?.length > 0 && <EventInformation data={ordersDates[0]} />}

      {ordersDates?.length > 0 && (
        <HorizontalDateTimePicker
          dates={ordersDates}
          times={allOrdersTime}
          selectedDateId={selectedDateId}
          selectedTimeId={selectedTimeId}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          loading={loading}
          type={type}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: "center" }}>
            <Statistic
              title="Total Bookings"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: "center" }}>
            <Statistic
              title="Completed"
              value={stats.success}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: "center" }}>
            <Statistic
              title="Processing"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: "center" }}>
            <Statistic
              title="Failed"
              value={stats.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default EventDetailsPage;
