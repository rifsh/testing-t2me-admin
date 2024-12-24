import React from "react";
import { Card, Row, Col, Typography, Image, Button } from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const VenueDetails = () => {
  const { singleVenues, loading,error,  } = useSelector(
      (state) => state.locations
    );
 


  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!singleVenues) return <div>No Venue Details Found</div>;

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
            {singleVenues.name}
          </Title>
          <Text>{singleVenues.description || "No description available"}</Text>
        </Card>
      </Col>

      <Col span={24}>
        <Card
          title={<span style={{ color: "#1890ff" }}>Venue Overview</span>}
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Address:</Text> {singleVenues.address}
            </Col>
            <Col span={12}>
              <Text strong>Capacity:</Text> {singleVenues.capacity}
            </Col>
            <Col span={12}>
              <Text strong>Indoor:</Text> {singleVenues.indoor ? "Yes" : "No"}
            </Col>
            <Col span={12}>
              <Text strong>Latitude:</Text> {singleVenues.latitude}
            </Col>
            <Col span={12}>
              <Text strong>Longitude:</Text> {singleVenues.longitude}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default VenueDetails;
