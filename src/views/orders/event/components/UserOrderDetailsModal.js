import React from "react";
import {
  Modal,
  Avatar,
  Typography,
  Button,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  Table,
  Empty,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserOrderDetailsModal = ({
  selectedUser,
  userModal,
  userBookings,
  handleModalClose,
  ticketColumns,
}) => {
  // Handle empty or null userBookings
  const bookingsData = userBookings || [];
  const hasBookings = bookingsData && bookingsData.length > 0;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ marginRight: 12, backgroundColor: "#1890ff" }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {selectedUser?.username || "User Details"}
            </Title>
            <Text type="secondary">Booking Details</Text>
          </div>
        </div>
      }
      open={userModal}
      onCancel={handleModalClose}
      width={1200}
      footer={[
        <Button key="close" onClick={handleModalClose}>
          Close
        </Button>,
      ]}
    >
      {selectedUser && (
        <>
          <Card title="Customer Information" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Name">
                {selectedUser.username || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedUser.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedUser.phone_number || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Customer ID">
                <Tag color="blue">{selectedUser.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Bookings">
                <Tag color="blue">{selectedUser.total_bookings || 0}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Items Booked">
                <Tag color="green">{selectedUser.total_items_booked || 0}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Success Bookings"
                  value={selectedUser.success_bookings || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Failed Bookings"
                  value={selectedUser.failed_bookings || 0}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Pending Bookings"
                  value={selectedUser.pending_bookings || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Booking Tickets</span>
                <Tag color="blue">{bookingsData.length} booking(s)</Tag>
              </div>
            }
            style={{ marginTop: 16 }}
          >
            {hasBookings ? (
              <Table
                dataSource={bookingsData}
                rowKey="id"
                columns={ticketColumns}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} bookings`,
                }}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty
                description="No booking tickets found for this user"
                style={{ padding: "40px 0" }}
              />
            )}
          </Card>
        </>
      )}
    </Modal>
  );
};

export default UserOrderDetailsModal;
