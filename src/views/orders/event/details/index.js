import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Statistic, Button, Avatar, Tag } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fethEventOrderDetails } from "store/slices/ordersSlice";

// Mock detailed booking data
const mockBookingDetails = {
  1: Array.from({ length: 25 }, (_, i) => ({
    id: 101 + i,
    customer_name: `Customer ${i + 1}`,
    customer_email: `customer${i + 1}@email.com`,
    ticket_type:
      i % 3 === 0 ? "VIP" : i % 2 === 0 ? "Premium" : "General Admission",
    quantity: Math.floor(Math.random() * 4) + 1,
    total_amount: Math.floor(Math.random() * 500) + 50,
    booking_status:
      i % 4 === 0 ? "failed" : i % 3 === 0 ? "pending" : "completed",
    booking_date: `2024-06-${String(
      Math.floor(Math.random() * 28) + 1
    ).padStart(2, "0")}T${String(Math.floor(Math.random() * 24)).padStart(
      2,
      "0"
    )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00Z`,
    payment_method: i % 2 === 0 ? "Credit Card" : "PayPal",
    order_id: `ORD-${String(i + 1).padStart(3, "0")}-2024`,
  })),
  2: Array.from({ length: 18 }, (_, i) => ({
    id: 201 + i,
    customer_name: `Tech Attendee ${i + 1}`,
    customer_email: `tech${i + 1}@email.com`,
    ticket_type: "Early Bird",
    quantity: 1,
    total_amount: 300,
    booking_status: i % 5 === 0 ? "pending" : "completed",
    booking_date: `2024-06-${String(
      Math.floor(Math.random() * 28) + 1
    ).padStart(2, "0")}T10:20:00Z`,
    payment_method: "Credit Card",
    order_id: `ORD-TECH-${String(i + 1).padStart(3, "0")}-2024`,
  })),
  3: Array.from({ length: 12 }, (_, i) => ({
    id: 301 + i,
    customer_name: `Food Explorer ${i + 1}`,
    customer_email: `foodie${i + 1}@email.com`,
    ticket_type: "Standard",
    quantity: Math.floor(Math.random() * 3) + 1,
    total_amount: Math.floor(Math.random() * 200) + 100,
    booking_status: i % 6 === 0 ? "failed" : "completed",
    booking_date: `2024-06-${String(
      Math.floor(Math.random() * 28) + 1
    ).padStart(2, "0")}T15:30:00Z`,
    payment_method: i % 2 === 0 ? "Credit Card" : "Debit Card",
    order_id: `ORD-FOOD-${String(i + 1).padStart(3, "0")}-2024`,
  })),
  4: Array.from({ length: 8 }, (_, i) => ({
    id: 401 + i,
    customer_name: `Art Lover ${i + 1}`,
    customer_email: `art${i + 1}@email.com`,
    ticket_type: "Gallery Pass",
    quantity: 1,
    total_amount: 150,
    booking_status: i % 4 === 0 ? "pending" : "completed",
    booking_date: `2024-06-${String(
      Math.floor(Math.random() * 28) + 1
    ).padStart(2, "0")}T18:00:00Z`,
    payment_method: "Credit Card",
    order_id: `ORD-ART-${String(i + 1).padStart(3, "0")}-2024`,
  })),
  5: Array.from({ length: 30 }, (_, i) => ({
    id: 501 + i,
    customer_name: `Runner ${i + 1}`,
    customer_email: `runner${i + 1}@email.com`,
    ticket_type: "Marathon Entry",
    quantity: 1,
    total_amount: 50,
    booking_status: i % 8 === 0 ? "failed" : "completed",
    booking_date: `2024-03-${String(
      Math.floor(Math.random() * 28) + 1
    ).padStart(2, "0")}T12:00:00Z`,
    payment_method: i % 3 === 0 ? "PayPal" : "Credit Card",
    order_id: `ORD-RUN-${String(i + 1).padStart(3, "0")}-2024`,
  })),
};

const EventDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("details");
  const [bookingData, setBookingData] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    dispatch(fethEventOrderDetails({ schedule_id: 78 }));
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.event) {
      setEvent(location.state.event);
    } else {
      const mockEvents = [
        {
          id: 1,
          event_name: "Summer Music Festival 2024",
          event_code: "SMF2024",
          event_date: "2024-08-15",
          location: "Central Park, New York",
          total_orders: 245,
          completed_bookings: 198,
          pending_bookings: 32,
          failed_bookings: 15,
          total_revenue: 49000,
          status: "active",
          created_at: "2024-06-01T10:30:00Z",
          image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center",
        },
      ];
      const foundEvent = mockEvents.find((e) => e.id === parseInt(id));
      setEvent(foundEvent);
    }
  }, [id, location.state]);

  useEffect(() => {
    if (activeTab === "bookings" && event) {
      setBookingLoading(true);
      setTimeout(() => {
        setBookingData(mockBookingDetails[event.id] || []);
        setBookingLoading(false);
      }, 500);
    }
  }, [activeTab, event]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "active":
        return "processing";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "pending":
        return <ClockCircleOutlined />;
      case "failed":
        return <CloseCircleOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const handleBackToList = () => {
    navigate(-1);
  };

  const bookingColumns = [
    {
      title: "Customer",
      dataIndex: "customer_name",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{name}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>
            {record.customer_email}
          </div>
        </div>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "order_id",
      render: (orderId) => <Tag color="purple">{orderId}</Tag>,
    },
    {
      title: "Ticket Details",
      dataIndex: "ticket_type",
      render: (type, record) => (
        <div>
          <div>
            <strong>{type}</strong>
          </div>
          <div style={{ color: "#666" }}>Qty: {record.quantity}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      render: (amount) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>${amount}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "booking_status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      render: (method) => <Tag>{method}</Tag>,
    },
    {
      title: "Booking Date",
      dataIndex: "booking_date",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  if (!event) {
    return (
      <div>
        <Button onClick={handleBackToList}>← Back to Events List</Button>
        <Card style={{ marginTop: 16 }}>
          <p>Event not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: 24 }}>
        <Button onClick={handleBackToList} style={{ marginBottom: 16 }}>
          ← Back to Events List
        </Button>
      </div>

      {/* Event Header */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <Avatar src={event.image} size={64} style={{ marginRight: 16 }} />
          <div>
            <h2 style={{ margin: 0 }}>{event.event_name}</h2>
            <p style={{ margin: 0, color: "#666" }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {event.location}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: 16 }}>
          <Button
            type={activeTab === "details" ? "primary" : "default"}
            onClick={() => setActiveTab("details")}
            style={{ marginRight: 8 }}
          >
            Event Details
          </Button>
          <Button
            type={activeTab === "bookings" ? "primary" : "default"}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings ({event.total_orders})
          </Button>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "details" && (
        <>
          {/* Event Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: "center" }}>
                <Statistic
                  title="Total Orders"
                  value={event.total_orders}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: "center" }}>
                <Statistic
                  title="Completed"
                  value={event.completed_bookings}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: "center" }}>
                <Statistic
                  title="Pending"
                  value={event.pending_bookings}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: "center" }}>
                <Statistic
                  title="Failed"
                  value={event.failed_bookings}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Event Information */}
          <Card title="Event Information">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Event Code:</strong>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {event.event_code}
                  </Tag>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Event Date:</strong>
                  <span style={{ marginLeft: 8 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(event.event_date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Status:</strong>
                  <Tag
                    color={getStatusColor(event.status)}
                    icon={getStatusIcon(event.status)}
                    style={{ marginLeft: 8 }}
                  >
                    {event.status?.toUpperCase()}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Total Revenue:</strong>
                  <span
                    style={{
                      color: "#52c41a",
                      fontWeight: "bold",
                      marginLeft: 8,
                    }}
                  >
                    <DollarOutlined style={{ marginRight: 4 }} />$
                    {event.total_revenue?.toLocaleString()}
                  </span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Created Date:</strong>
                  <span style={{ marginLeft: 8 }}>
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {activeTab === "bookings" && (
        <Card title={`Bookings for ${event.event_name}`}>
          <Table
            dataSource={bookingData}
            rowKey="id"
            loading={bookingLoading}
            columns={bookingColumns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              //   showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} bookings`,
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default EventDetailsPage;
