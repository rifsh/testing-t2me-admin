import React, { useEffect } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  List,
  Empty,
  Spin,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleUser } from "store/slices/userSlice";
import { APP_FEATURE_FLAGS } from "configs/AppConfig";

const { Title, Text } = Typography;

const UserDetail = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { userDetails, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    if (userId) {
      dispatch(getSingleUser(userId));
    }
  }, [dispatch, userId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" tip="Loading user details..." />
      </div>
    );
  }

  if (error) {
    return <Empty description={`Error: ${error}`} />;
  }

  if (!userDetails || !userDetails.user) {
    return <Empty description="No User Data Available" />;
  }

  const { user, events = [], theatres = [] } = userDetails;

  return (
    <Card>
      {/* User Info Section */}
      <Row align="middle" gutter={[24, 24]}>
        <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
          {user.thumbnail_image && user.thumbnail_image !== "images" ? (
            <Avatar
              src={user.thumbnail_image}
              size={96}
              alt={`${user.username} thumbnail`}
              style={{ borderRadius: 16, marginBottom: 12 }}
            />
          ) : (
            <Avatar
              size={96}
              style={{
                backgroundColor: "#7265e6",
                fontSize: 36,
                fontWeight: "bold",
                marginBottom: 12,
              }}
            >
              {user.username[0]?.toUpperCase()}
            </Avatar>
          )}
        </Col>

        <Col xs={24} sm={18} md={20}>
          <Title level={3} style={{ marginBottom: 8 }}>
            {user.username}
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            {user.role?.name || "Role not assigned"}
          </Text>

          <Descriptions
            colon={false}
            column={{ xs: 1, sm: 2 }}
            labelStyle={{ fontWeight: 600, color: "#555" }}
            contentStyle={{ color: "#333" }}
            size="middle"
            bordered
          >
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {user.phone_number || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Text strong type={user.is_active ? "success" : "danger"}>
                {user.is_active ? "Active" : "Inactive"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Account Created">
              {new Date(user.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(user.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Divider />

      {/* Events and Theatres Section */}
      <Row gutter={[24, 24]}>
        {APP_FEATURE_FLAGS.EVENT && (
          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="Assigned Events"
              bordered
              style={{ minHeight: 200 }}
              headStyle={{ fontWeight: 600 }}
            >
              {events.length > 0 ? (
                <List
                  dataSource={events}
                  renderItem={(event) => (
                    <List.Item>
                      <Text>{event.name || `Event ID: ${event.id}`}</Text>
                    </List.Item>
                  )}
                  bordered={false}
                  size="small"
                />
              ) : (
                <Empty
                  description="No Events Assigned"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        )}

        {APP_FEATURE_FLAGS.MOVIE && (
          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="Assigned Theatres"
              bordered
              style={{ minHeight: 200 }}
              headStyle={{ fontWeight: 600 }}
            >
              {theatres.length > 0 ? (
                <List
                  dataSource={theatres}
                  renderItem={(theatre) => (
                    <List.Item>
                      <Text>{theatre.name || `Theatre ID: ${theatre.id}`}</Text>
                    </List.Item>
                  )}
                  bordered={false}
                  size="small"
                />
              ) : (
                <Empty
                  description="No Theatres Assigned"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default UserDetail;
