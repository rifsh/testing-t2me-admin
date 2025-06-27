import React from "react";
import { Card, Row, Col, Tag, Typography, Space } from "antd";
import { CalendarOutlined, ClockCircleOutlined, InfoCircleOutlined, InfoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function TheaterInformation({ data }) {

  return (
    <div>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Theater Information
          </Title>
        }
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ fontSize: "16px" }}>
                  Schedule Name:
                </Text>
                <div style={{ marginTop: 8 }}>
                  <InfoCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text style={{ fontSize: "14px" }}>
                    {data?.schedule?.name || "N/A"}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ fontSize: "16px" }}>
                  Theater Name:
                </Text>
                <div style={{ marginTop: 8 }}>
                  <InfoCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text style={{ fontSize: "14px" }}>
                    {data?.schedule?.theatre?.name || "N/A"}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}