import React, { useEffect } from "react";
import {
  Avatar,
  Typography,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  Table,
  Empty,
  Button,
  Spin,
  Collapse,
  Space,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMovieOrderDetailsTime } from "store/slices/ordersSlice";
import { BOOKING_TYPE } from "constants/AppConstants";

const { Title, Text } = Typography;

const UserOrderDetailsPage = () => {
  const params = useParams();
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const type = param.get("type");
  const { schedule_id, date_id, time_id, user_id } = params;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingTickets, loading } = useSelector((state) => state.orderSlice);

  useEffect(() => {
    dispatch(
      getMovieOrderDetailsTime({
        schedule_id: schedule_id,
        ...(type === BOOKING_TYPE.EVENT_TICKET
          ? { show_date_id: date_id }
          : { start_date: date_id }),
        show_time_id: time_id,
        user_id: user_id,
      })
    );
  }, [dispatch, schedule_id, date_id, time_id, user_id]);

  // Get user data based on booking type
  const selectedUser =
    type === BOOKING_TYPE.EVENT_TICKET
      ? bookingTickets?.booking_tickets?.[0]?.user || {}
      : bookingTickets?.user_seat_bookings?.user || {};

  const stats = {
    totalBookings: bookingTickets?.total_bookings || 0,
    successBookings: bookingTickets?.success_bookings || 0,
    failedBookings: bookingTickets?.failed_bookings || 0,
    pendingBookings: bookingTickets?.pending_bookings || 0,
  };

  // Get bookings data based on type
  const bookingsData =
    type === BOOKING_TYPE.EVENT_TICKET
      ? bookingTickets?.booking_tickets || []
      : bookingTickets?.user_seat_bookings?.bookings || [];

  // Transform ticket bookings to show each ticket as a separate row
  const transformedTicketBookings = [];
  if (type === BOOKING_TYPE.EVENT_TICKET) {
    bookingsData.forEach((booking) => {
      if (booking.booking_items && booking.booking_items.length > 0) {
        booking.booking_items.forEach((item, itemIndex) => {
          // Create individual rows for each ticket within the booking item
          for (
            let ticketIndex = 0;
            ticketIndex < (item.num_of_tickets || 1);
            ticketIndex++
          ) {
            transformedTicketBookings.push({
              ...booking,
              booking_item: item,
              ticketNumber: ticketIndex + 1,
              totalTicketsInItem: item.num_of_tickets,
              itemIndex: itemIndex,
              ticketIndex: ticketIndex,
              uniqueKey: `${booking.id}-${item.id}-${ticketIndex}`,
            });
          }
        });
      } else {
        // Handle bookings without items
        transformedTicketBookings.push({
          ...booking,
          booking_item: null,
          ticketNumber: 1,
          totalTicketsInItem: 1,
          itemIndex: 0,
          ticketIndex: 0,
          uniqueKey: booking.id,
        });
      }
    });
  }

  // Transform seat bookings to show each seat as a separate row
  const transformedSeatBookings = [];
  if (type !== BOOKING_TYPE.EVENT_TICKET) {
    bookingsData.forEach((booking) => {
      if (booking.seats && booking.seats.length > 0) {
        booking.seats.forEach((seat, index) => {
          transformedSeatBookings.push({
            ...booking,
            seat: seat,
            seatIndex: index,
            uniqueKey: `${booking.booking_id}-${seat.id}`,
          });
        });
      } else {
        // Handle bookings without seats
        transformedSeatBookings.push({
          ...booking,
          seat: null,
          seatIndex: 0,
          uniqueKey: booking.booking_id,
        });
      }
    });
  }

  const finalBookingsData =
    type === BOOKING_TYPE.EVENT_TICKET
      ? transformedTicketBookings
      : transformedSeatBookings;

  const hasBookings = finalBookingsData.length > 0;
  const eventName = bookingTickets?.schedule?.name || "Event";
  const isEventTicket = type === BOOKING_TYPE.EVENT_TICKET;

  // Updated columns for individual ticket bookings
  const ticketColumns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      width: 100,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Ticket Details",
      dataIndex: "booking_item",
      render: (item, record) => (
        <div>
          {item ? (
            <div style={{ marginBottom: 8 }}>
              <div>
                <Text strong>{item.ticket_type?.name || "N/A"}</Text>
                <Tag color="green" style={{ marginLeft: 8 }}>
                  Ticket {record.ticketNumber} of {record.totalTicketsInItem}
                </Tag>
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Price: ₹{item.ticket_type?.price || 0} each
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Ticket Set: {item.ticket_type?.ticket_set || "N/A"}
              </div>
            </div>
          ) : (
            <Text type="secondary">No ticket information</Text>
          )}
        </div>
      ),
    },
    {
      title: "Show Details",
      dataIndex: "booking_item",
      render: (item) => (
        <div>
          {item ? (
            <div style={{ fontSize: "12px" }}>
              <div>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {item.show_date?.start_date || "N/A"}
              </div>
              <div>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {item.show_time?.start_time || "N/A"} -{" "}
                {item.show_time?.end_time || "N/A"}
              </div>
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              No show details
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Ticket Amount",
      dataIndex: "booking_item",
      render: (item, record) => {
        const ticketPrice = item?.ticket_type?.price || 0;
        const totalBookingAmount = record.amount || 0;
        const totalTicketsInBooking =
          record.booking_items?.reduce(
            (sum, bookingItem) => sum + (bookingItem.num_of_tickets || 0),
            0
          ) || 1;
        const proportionalAmount = Math.round(
          totalBookingAmount / totalTicketsInBooking
        );

        return (
          <div>
            <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
              ₹{ticketPrice}
            </Text>
            <div style={{ fontSize: "11px", color: "#666" }}>
              Proportional: ₹{proportionalAmount}
            </div>
            {record.original_amount !== record.amount && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  textDecoration: "line-through",
                }}
              >
                Original: ₹
                {Math.round(
                  (record.original_amount || 0) / totalTicketsInBooking
                )}
              </div>
            )}
          </div>
        );
      },
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

  // Updated columns for individual seat bookings
  const seatColumns = [
    {
      title: "Booking ID",
      dataIndex: "booking_id",
      width: 150,
      render: (id) => <Tag color="blue">#{id?.slice(0, 8)}...</Tag>,
    },
    {
      title: "Seat Details",
      dataIndex: "seat",
      render: (seat) => (
        <div>
          {seat ? (
            <div>
              <Tag color="purple" style={{ marginRight: 4, marginBottom: 4 }}>
                {seat.label}
              </Tag>
              <Tag color="gold" style={{ marginBottom: 4 }}>
                {seat.type}
              </Tag>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Seat Price: ₹{seat.price}
              </div>
            </div>
          ) : (
            <Text type="secondary">No seat information</Text>
          )}
        </div>
      ),
    },
    {
      title: "Payment Details",
      render: (record) => {
        // Calculate proportional amounts for individual seats
        const totalSeats = record.seats?.length || 1;
        const seatProportion = 1 / totalSeats;

        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text strong>Original: </Text>
              <Text>
                ₹{Math.round((record.original_amount || 0) * seatProportion)}
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text strong>After Discount: </Text>
              <Text>
                ₹
                {Math.round(
                  (record.amount_after_discount || 0) * seatProportion
                )}
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text strong>Tax: </Text>
              <Text>
                ₹{Math.round((record.tax_amount || 0) * seatProportion)}
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text strong>Payment Charge: </Text>
              <Text>
                ₹{Math.round((record.payment_charge || 0) * seatProportion)}
              </Text>
            </div>
            <div>
              <Text strong style={{ color: "#52c41a" }}>
                Final:
              </Text>
              <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                ₹{Math.round((record.final_amount || 0) * seatProportion)}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      render: (status) => {
        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case "success":
            case "completed":
              return "green";
            case "failed":
              return "red";
            case "pending":
              return "orange";
            default:
              return "default";
          }
        };
        return (
          <Tag color={getStatusColor(status)}>
            {status?.toUpperCase() || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Contact Info",
      render: (record) => (
        <div style={{ fontSize: "12px" }}>
          <div>{record.email || "N/A"}</div>
          <div>{record.phone || "N/A"}</div>
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

  const onBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBackClick}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Title level={2} style={{ marginBottom: 0 }}>
          User {isEventTicket ? "Ticket" : "Seat"} Booking Details
        </Title>
        <Text type="secondary">
          Event: {eventName} | Booking Type:{" "}
          {isEventTicket ? "Event Tickets" : "Seat Reservations"}
        </Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ marginRight: 16, backgroundColor: "#1890ff" }}
            src={selectedUser.thumbnail_image}
          />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {selectedUser?.username || "User Details"}
            </Title>
            <Text type="secondary">
              {isEventTicket
                ? "Ticket Booking History"
                : "Seat Booking History"}
            </Text>
          </div>
        </div>

        <Descriptions bordered column={2} size="default">
          <Descriptions.Item label="Name">
            {selectedUser?.username || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {selectedUser?.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {selectedUser?.phone_number || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Customer ID">
            <Tag color="blue">{selectedUser?.id || "N/A"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Bookings">
            <Tag color="blue">{stats.totalBookings}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Event">
            <Tag color="purple">{eventName}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Bookings"
              value={stats.successBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Failed Bookings"
              value={stats.failedBookings}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Bookings"
              value={stats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>
              {isEventTicket ? "Booking Tickets" : "Individual Seat Bookings"}
            </span>
            <Tag color="blue" style={{ marginLeft: 12 }}>
              {finalBookingsData.length}{" "}
              {isEventTicket ? "booking(s)" : "seat(s)"}
            </Tag>
          </div>
        }
      >
        {hasBookings ? (
          <Table
            dataSource={finalBookingsData}
            rowKey={isEventTicket ? "id" : "uniqueKey"}
            columns={isEventTicket ? ticketColumns : seatColumns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) =>
                `Total ${total} ${isEventTicket ? "bookings" : "seats"}`,
            }}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty
            description={`No ${
              isEventTicket ? "ticket" : "seat"
            } bookings found for this user`}
            style={{ padding: "40px 0" }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserOrderDetailsPage;
