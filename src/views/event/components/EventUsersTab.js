import React from "react";
import { Card, Col, Image, Typography } from "antd";

const { Title, Text } = Typography;

const EventUsersTab = ({ user }) => {
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
                    {user.thumbnail_image ? (
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
                    ) : (
                        <div
                            style={{
                                height: 80,
                                width: 80,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f0f7ff",
                                color: "#1890ff",
                                borderRadius: "50%",
                                margin: "0 auto",
                                fontSize: "24px"
                            }}
                        >
                            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                        </div>
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
    )
}

export default EventUsersTab