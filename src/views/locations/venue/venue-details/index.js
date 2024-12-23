import React from "react";
import { Card, Row, Col, Typography, Image, Button } from "antd";
import Loading from "components/shared-components/Loading";

const { Title, Text } = Typography;

const VenueDetails = () => {
  const venueDetails = {
    status: false,
    created_at: "2024-12-07T10:44:22.535165",
    updated_at: "2024-12-20T23:08:36.197918",
    name: "Fort Hall",
    capacity: 167,
    indoor: false,
    address: "Sham Colony, Tune Lane, Manjeri",
    latitude: 11.235885308999642,
    longitude: 80.15521519019,
    id: 7,
  };

  const loading = false;
  const error = null;

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!venueDetails) return <div>No Venue Details Found</div>;

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          bordered={false}
          cover={
            <Image
              alt="venue image"
              src="https://via.placeholder.com/800x400.png?text=Venue+Image"
              height={300}
              style={{ objectFit: "cover" }}
            />
          }
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {venueDetails.name}
          </Title>
          <Text>{venueDetails.description || "No description available"}</Text>
        </Card>
      </Col>

      <Col span={24}>
        <Card
          title={<span style={{ color: "#1890ff" }}>Venue Overview</span>}
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Address:</Text> {venueDetails.address}
            </Col>
            <Col span={12}>
              <Text strong>Capacity:</Text> {venueDetails.capacity}
            </Col>
            <Col span={12}>
              <Text strong>Indoor:</Text> {venueDetails.indoor ? "Yes" : "No"}
            </Col>
            <Col span={12}>
              <Text strong>Latitude:</Text> {venueDetails.latitude}
            </Col>
            <Col span={12}>
              <Text strong>Longitude:</Text> {venueDetails.longitude}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default VenueDetails;
