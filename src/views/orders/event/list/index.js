import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Statistic,
  Badge,
  Button,
  Space,
  Avatar,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Mock data for events
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
  {
    id: 2,
    event_name: "Tech Conference 2024",
    event_code: "TECH2024",
    event_date: "2024-09-22",
    location: "Convention Center, San Francisco",
    total_orders: 156,
    completed_bookings: 134,
    pending_bookings: 18,
    failed_bookings: 4,
    total_revenue: 78000,
    status: "active",
    created_at: "2024-05-15T14:20:00Z",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: 3,
    event_name: "Food & Wine Expo",
    event_code: "FWE2024",
    event_date: "2024-07-30",
    location: "Grand Hall, Chicago",
    total_orders: 89,
    completed_bookings: 76,
    pending_bookings: 8,
    failed_bookings: 5,
    total_revenue: 22500,
    status: "completed",
    created_at: "2024-04-10T09:15:00Z",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: 4,
    event_name: "Art Gallery Opening",
    event_code: "AGO2024",
    event_date: "2024-10-05",
    location: "Modern Art Museum, Los Angeles",
    total_orders: 67,
    completed_bookings: 45,
    pending_bookings: 15,
    failed_bookings: 7,
    total_revenue: 13400,
    status: "active",
    created_at: "2024-06-20T16:45:00Z",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: 5,
    event_name: "Marathon 2024",
    event_code: "MAR2024",
    event_date: "2024-11-12",
    location: "City Streets, Boston",
    total_orders: 312,
    completed_bookings: 298,
    pending_bookings: 10,
    failed_bookings: 4,
    total_revenue: 15600,
    status: "active",
    created_at: "2024-03-25T11:00:00Z",
    image:
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=100&h=100&fit=crop&crop=center",
  },
];

const OrdersList = () => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setFilteredEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);

  const handleViewDetails = (event) => {
    navigate(`/reports/orders/event/details/${event.id}`, { state: { event } });
  };

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
      case "active":
        return <CheckCircleOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const tableColumns = [
    {
      title: "Event",
      dataIndex: "event_name",
      key: "event_name",
      render: (event_name, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={record.image}
            size={40}
            style={{ marginRight: 12 }}
            icon={<CalendarOutlined />}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{event_name || "N/A"}</div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {record.location}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Event Code",
      dataIndex: "event_code",
      key: "event_code",
      render: (code) => <Tag color="blue">{code || "N/A"}</Tag>,
    },
    {
      title: "Event Date",
      dataIndex: "event_date",
      key: "event_date",
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: "Total Orders",
      dataIndex: "total_orders",
      key: "total_orders",
      render: (total) => (
        <Badge count={total} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Booking Status",
      key: "booking_status",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#52c41a" }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              Completed: {record.completed_bookings}
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
      title: "Revenue",
      dataIndex: "total_revenue",
      key: "total_revenue",
      render: (revenue) => (
        <div style={{ color: "#52c41a", fontWeight: "bold" }}>
          <DollarOutlined style={{ marginRight: 4 }} />$
          {revenue?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate total statistics
  const totalStats = filteredEvents.reduce(
    (acc, event) => ({
      totalOrders: acc.totalOrders + event.total_orders,
      completedBookings: acc.completedBookings + event.completed_bookings,
      pendingBookings: acc.pendingBookings + event.pending_bookings,
      failedBookings: acc.failedBookings + event.failed_bookings,
      totalRevenue: acc.totalRevenue + event.total_revenue,
    }),
    {
      totalOrders: 0,
      completedBookings: 0,
      pendingBookings: 0,
      failedBookings: 0,
      totalRevenue: 0,
    }
  );

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={totalStats.totalOrders}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Bookings"
              value={totalStats.completedBookings}
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
              title="Total Revenue"
              value={totalStats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Events & Orders Overview">
        <Table
          columns={tableColumns}
          dataSource={filteredEvents}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersList;
