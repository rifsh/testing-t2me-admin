import React from "react";
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
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import PageHeader from "components/layout-components/PageHeader";

const { Title, Text } = Typography;

const UserOrderDetailsPage = ({
  selectedUser,
  userBookings,
  onBackClick, // Function to handle back navigation
  ticketColumns,
}) => {
  const bookingsData = userBookings || [];
  const hasBookings = bookingsData.length > 0;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader
        title="User Booking Details"
        onBack={onBackClick}
        backIcon={<ArrowLeftOutlined />}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={onBackClick}>
            Back
          </Button>,
        ]}
        style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
      />

      <Card style={{ marginBottom: 24 }}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ marginRight: 16, backgroundColor: "#1890ff" }}
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
            <Tag color="blue">{selectedUser?.total_bookings || 0}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Items Booked">
            <Tag color="green">{selectedUser?.total_items_booked || 0}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Success Bookings"
              value={selectedUser?.success_bookings || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Failed Bookings"
              value={selectedUser?.failed_bookings || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Bookings"
              value={selectedUser?.pending_bookings || 0}
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
