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
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEventOrderDetailsTime } from "store/slices/ordersSlice";

const { Title, Text } = Typography;

const UserOrderDetailsPage = () => {
  const params = useParams();
  const { schedule_id, date_id, time_id, user_id } = params;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingTickets, loading } = useSelector((state) => state.orderSlice);

  useEffect(() => {
    dispatch(
      getEventOrderDetailsTime({
        schedule_id: schedule_id,
        show_date_id: date_id,
        show_time_id: time_id,
        user_id: user_id,
      })
    );
  }, [dispatch, schedule_id, date_id, time_id, user_id]);

  const selectedUser = bookingTickets?.booking_tickets?.[0]?.user || {};

  const stats = {
    totalBookings: bookingTickets?.total_bookings || 0,
    successBookings: bookingTickets?.success_bookings || 0,
    failedBookings: bookingTickets?.failed_bookings || 0,
    pendingBookings: bookingTickets?.pending_bookings || 0,
  };

  const bookingsData = bookingTickets?.booking_tickets || [];
  const hasBookings = bookingsData.length > 0;

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
                <ClockCircleOutlined style={{ marginRight: 4 }} />
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
    navigate(-1); // Go back to previous page
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
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBackClick}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Title level={2} style={{ marginBottom: 0 }}>
          User Booking Details
        </Title>
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
            <Text type="secondary">Booking History</Text>
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
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Success Bookings"
              value={stats.successBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Failed Bookings"
              value={stats.failedBookings}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={8}>
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
            <span style={{ fontSize: 18 }}>Booking Tickets</span>
            <Tag color="blue" style={{ marginLeft: 12 }}>
              {bookingsData.length} booking(s)
            </Tag>
          </div>
        }
      >
        {hasBookings ? (
          <Table
            dataSource={bookingsData}
            rowKey="id"
            columns={ticketColumns}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty
            description="No booking tickets found for this user"
            style={{ padding: "40px 0" }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserOrderDetailsPage;
