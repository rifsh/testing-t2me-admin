import React from "react";
import { Card, Col, Image, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EventUsersTab = ({ user }) => {
    const showAvatar = !user.thumbnail_image || user.thumbnail_image.includes("images");

    return (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
                hoverable
                style={{
                    textAlign: "center",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    border: "none"
                }}
                bodyStyle={{ padding: "16px 8px" }}
            >
                <div style={{ marginBottom: "8px" }}>
                    {showAvatar ? (
                        <Avatar
                            size={80}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: "#f0f7ff",
                                color: "#1890ff",
                                fontSize: "32px",
                            }}
                        />
                    ) : (
                        <Image
                            alt="User Thumbnail"
                            src={user.thumbnail_image}
                            height={80}
                            width={80}
                            style={{
                                objectFit: "cover",
                                borderRadius: "50%",
                                border: "4px solid #f0f7ff"
                            }}
                            preview={false}
                        />
                    )}
                </div>
                <Title level={5} style={{ marginBottom: "4px", fontSize: "16px" }}>
                    {user.username}
                </Title>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                    {user.role?.name || "N/A"}
                </Text>
            </Card>
        </Col>
    );
};

export default EventUsersTab;
