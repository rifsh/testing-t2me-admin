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
  Empty,
  Button,
  Spin,
  Collapse,
  Space,
  Badge,
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
  CreditCardOutlined,
  SolutionOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEventOrderDetailsTime } from "store/slices/ordersSlice";
import { BOOKING_TYPE } from "constants/AppConstants";
import { FaTicketAlt } from "react-icons/fa";
import { CDN_PATH } from "configs/AppConfig";
import BookingOfferCard from "../components/BookingOfferCard";
import SeatOfferCard from "../components/SeatOfferCard";

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
      getEventOrderDetailsTime({
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
    pendingBookings: bookingTickets?.processing_bookings || 0,
  };

  // Get bookings data based on type
  const bookingsData =
    type === BOOKING_TYPE.EVENT_TICKET
      ? bookingTickets?.booking_tickets || []
      : bookingTickets?.user_seat_bookings?.bookings || [];

  const hasBookings = bookingsData.length > 0;
  const eventName = bookingTickets?.schedule?.name || "Event";
  const isEventTicket = type === BOOKING_TYPE.EVENT_TICKET;

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "paid":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "paid":
        return <CheckCircleOutlined />;
      case "failed":
        return <CloseCircleOutlined />;
      case "pending":
        return <ClockCircleOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  // Render ticket bookings with collapsible tickets
  const renderTicketBookings = () => {
    console.log("BookingOffer", bookingsData);

    return (
      <div style={{ marginTop: 16 }}>
        {bookingsData.map((booking, index) => {
          // Calculate total tickets from booking items
          const totalTickets =
            booking.booking_items?.reduce(
              (sum, item) => sum + (item.num_of_tickets || 0),
              0
            ) || 0;

          return (
            <Card
              key={booking.id}
              style={{ marginBottom: 16 }}
              size="small"
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <SolutionOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Booking #{booking.id}</Text>
                    <Tag color="green">SUCCESS</Tag>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <Badge count={totalTickets} color="#52c41a">
                      <FaTicketAlt style={{ fontSize: 16 }} />
                    </Badge>
                    <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                      {booking.amount || 0}
                    </Text>
                  </div>
                </div>
              }
            >
              {/* Existing statistics and descriptions */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Statistic
                    title="Total Amount"
                    value={booking.amount || 0}
                    prefix=""
                    valueStyle={{
                      fontSize: 16,
                      color: "#52c41a",
                      fontWeight: "bold",
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Original Amount"
                    value={booking.original_amount || 0}
                    prefix=""
                    valueStyle={{ fontSize: 16 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Tickets"
                    value={totalTickets}
                    valueStyle={{ fontSize: 16, color: "#1890ff" }}
                  />
                </Col>
              </Row>

              <Descriptions
                size="small"
                column={2}
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="Booking Date">
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleString()
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Venue ID">
                  <Tag color="blue">{booking.venue_id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Schedule ID">
                  <Tag color="purple">{booking.schedule_id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Event ID">
                  <Tag color="green">{booking.event_id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Coupon Code">
                  {booking.coupon_code ? (
                    <Tag color="orange">{booking.coupon_code}</Tag>
                  ) : (
                    <Text type="secondary">No coupon used</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="User Email">
                  {booking.user?.email || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              {/* ADD THIS: Booking Offer Component */}
              {booking.booking_ticket_offer &&
                booking.booking_ticket_offer.length > 0 && (
                  <BookingOfferCard offerData={booking.booking_ticket_offer} />
                )}

              {/* Existing ticket details collapse */}
              <Collapse
                ghost
                expandIcon={({ isActive }) =>
                  isActive ? <DownOutlined /> : <RightOutlined />
                }
              >
                <Panel
                  header={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FaTicketAlt />
                      <Text strong>
                        Ticket Details ({totalTickets} tickets)
                      </Text>
                    </div>
                  }
                  key="tickets"
                >
                  {/* Existing ticket details rendering code */}
                  <Row gutter={[12, 12]}>
                    {booking.booking_items?.map((item, itemIndex) => (
                      <Col key={item.id} span={24}>
                        <Card
                          size="small"
                          style={{
                            border: "2px solid #52c41a",
                            marginBottom: 12,
                          }}
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={8}>
                              <div>
                                <Text
                                  strong
                                  style={{ color: "#1890ff", fontSize: 16 }}
                                >
                                  {item.ticket_type?.name || "N/A"}
                                </Text>
                                <div>
                                  <Tag color="green" style={{ marginTop: 4 }}>
                                    {item.num_of_tickets} tickets ×
                                    {item.ticket_type?.price || 0}
                                  </Tag>
                                </div>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div>
                                <div style={{ marginBottom: 4 }}>
                                  <CalendarOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text style={{ fontSize: 12 }}>
                                    {item.show_date?.start_date || "N/A"}
                                  </Text>
                                </div>
                                <div>
                                  <ClockCircleOutlined
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text style={{ fontSize: 12 }}>
                                    {item.show_time?.start_time || "N/A"} -{" "}
                                    {item.show_time?.end_time || "N/A"}
                                  </Text>
                                </div>
                              </div>
                            </Col>
                            <Col span={8} style={{ textAlign: "right" }}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Total Amount
                                </Text>
                                <div>
                                  <Text
                                    strong
                                    style={{ color: "#52c41a", fontSize: 18 }}
                                  >

                                    {(item.ticket_type?.price || 0) *
                                      (item.num_of_tickets || 0)}
                                  </Text>
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Divider style={{ margin: "12px 0" }} />

                          <Descriptions size="small" column={3}>
                            <Descriptions.Item label="Ticket Set">
                              {item.ticket_type?.ticket_set || "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Structure ID">
                              <Tag color="blue">{item.ticket_structure_id}</Tag>
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {(!booking.booking_items ||
                    booking.booking_items.length === 0) && (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No ticket details found for this booking"
                        />
                      </div>
                    )}
                </Panel>
              </Collapse>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render seat bookings with collapsible seats
  const renderSeatBookings = () => {
    console.log("sampleofferlist", bookingsData);

    return (
      <div style={{ marginTop: 16 }}>
        {bookingsData.map((booking, index) => (
          <Card
            key={booking.booking_id}
            style={{ marginBottom: 16 }}
            size="small"
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <SolutionOutlined style={{ color: "#1890ff" }} />
                  <Text strong>Booking #{booking.booking_id}</Text>
                  <Tag
                    color={getPaymentStatusColor(booking.payment_status)}
                    icon={getPaymentStatusIcon(booking.payment_status)}
                  >
                    {booking.payment_status?.toUpperCase() || "N/A"}
                  </Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Badge count={booking.seats?.length || 0} color="#52c41a">
                    <TeamOutlined style={{ fontSize: 16 }} />
                  </Badge>
                  <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                    {booking.final_charged_amount || booking.final_amount || 0}
                  </Text>
                </div>
              </div>
            }
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="Original Amount"
                  value={booking.original_amount || 0}
                  prefix=""
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tax Amount"
                  value={booking.tax_amount || 0}
                  prefix=""
                  valueStyle={{ fontSize: 16, color: "#fa8c16" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Payment Charge"
                  value={booking.payment_charge || 0}
                  prefix=""
                  valueStyle={{ fontSize: 16, color: "#722ed1" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Final Amount"
                  value={
                    booking.final_charged_amount || booking.final_amount || 0
                  }
                  prefix=""
                  valueStyle={{
                    fontSize: 16,
                    color: "#52c41a",
                    fontWeight: "bold",
                  }}
                />
              </Col>
            </Row>

            <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Booking Date">
                <CalendarOutlined style={{ marginRight: 4 }} />
                {booking.created_at
                  ? new Date(booking.created_at).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Initiated">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {booking.payment_initiated_at
                  ? new Date(booking.payment_initiated_at).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {booking.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {booking.phone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Order Reference">
                <Tag color="blue">{booking.order_reference}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                {booking.discounted_amount || 0}
              </Descriptions.Item>
            </Descriptions>

            {booking.offer_details &&
              booking.offer_details.length > 0 && (
                <SeatOfferCard
                  offerData={booking.offer_details}
                />
              )}

            <Collapse
              ghost
              expandIcon={({ isActive }) =>
                isActive ? <DownOutlined /> : <RightOutlined />
              }
            >
              <Panel
                header={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <TeamOutlined />
                    <Text strong>
                      Booked Seats ({booking.seats?.length || 0})
                    </Text>
                  </div>
                }
                key="seats"
              >
                <Row gutter={[12, 12]}>
                  {booking.seats?.map((seat, seatIndex) => (
                    <Col key={seat.id} span={8} md={6} lg={4}>
                      <Card
                        size="small"
                        style={{
                          textAlign: "center",
                          border: `2px solid ${seat.type === "vip"
                            ? "#722ed1"
                            : seat.type === "premium"
                              ? "#fa8c16"
                              : "#52c41a"
                            }`,
                        }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <Tag
                            color={
                              seat.type === "vip"
                                ? "purple"
                                : seat.type === "premium"
                                  ? "orange"
                                  : "green"
                            }
                            style={{ fontSize: 12, fontWeight: "bold" }}
                          >
                            {seat.label}
                          </Tag>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {seat.type?.toUpperCase()}
                          </Text>
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ color: "#52c41a", fontSize: 14 }}
                          >
                            {seat.price}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {(!booking.seats || booking.seats.length === 0) && (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No seats found for this booking"
                    />
                  </div>
                )}
              </Panel>
            </Collapse>
          </Card>
        ))}
      </div>
    );
  };

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
            src={`${CDN_PATH}/${selectedUser.thumbnail_image}`}
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
              prefix={<SolutionOutlined />}
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
              {isEventTicket ? "Ticket Bookings" : "Seat Bookings"}
            </span>
            <Tag color="blue" style={{ marginLeft: 12 }}>
              {bookingsData.length} booking(s)
            </Tag>
          </div>
        }
      >
        {hasBookings ? (
          isEventTicket ? (
            renderTicketBookings()
          ) : (
            renderSeatBookings()
          )
        ) : (
          <Empty
            description={`No ${isEventTicket ? "ticket" : "seat"
              } bookings found for this user`}
            style={{ padding: "40px 0" }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserOrderDetailsPage;
