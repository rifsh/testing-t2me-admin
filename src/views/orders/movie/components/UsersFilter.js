import React from "react";
import { Card, Select, Typography, Button, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const UsersFilter = ({
  usersList,
  selectedUserId,
  handleUserSelect,
  loading,
  pagination,
  handlePaginationChange,
}) => {
  return (
    <Card style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        <UserOutlined style={{ marginRight: 8 }} />
        Filter by Customer ({usersList.length} users)
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Select a customer"
          value={selectedUserId}
          onChange={handleUserSelect}
          style={{ width: "100%" }}
          loading={loading}
        >
          <Option value={null}>All Customers</Option>
          {usersList.map((user) => (
            <Option key={user.id} value={user.id}>
              <Badge dot status="success" style={{ marginRight: 4 }} />
              {user.username}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={pagination.current === 1}
          onClick={() => handlePaginationChange(pagination.current - 1)}
        >
          Previous
        </Button>
        <span>
          Page {pagination.current} of{" "}
          {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <Button
          disabled={
            pagination.current * pagination.pageSize >= pagination.total
          }
          onClick={() => handlePaginationChange(pagination.current + 1)}
        >
          Next
        </Button>
      </div>
    </Card>
  );
};

export default UsersFilter;
