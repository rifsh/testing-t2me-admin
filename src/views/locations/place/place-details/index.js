import React from "react";
import { Card, Row, Col, Typography, Image, Alert, Carousel } from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const PlaceDetails = () => {
  const { singlePlace, loading, error } = useSelector((state) => state.locations);

  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singlePlace) return <div>No place details found</div>;

  const mediaImages = singlePlace.media?.map((item) => item.media_url) || [];

  const isNoImage = !singlePlace.thumbnail_image || singlePlace.thumbnail_image === "images";

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          bordered={false}
          cover={
            isNoImage ? (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  color: "#888",
                }}
              >
                No Image
              </div>
            ) : (
              <Image
                alt="place thumbnail"
                src={singlePlace.thumbnail_image}
                height={300}
                style={{ objectFit: "cover" }}
              />
            )
          }
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {singlePlace.name}
          </Title>
          <Text>{singlePlace.country?.name}</Text>
        </Card>
      </Col>

      <Col span={24}>
        <Card
          title={<span style={{ color: "#1890ff" }}>Place Overview</span>}
          bordered={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
            <Text strong>Country:</Text> {singlePlace.country?.name || "Not Available"}
              {/* <Text strong>Address:</Text> {singlePlace.address || "Not Available"} */}
            </Col>
            <Col span={12}>
              {/* <Text strong>Country:</Text> {singlePlace.country?.name || "Not Available"} */}
            </Col>
          </Row>
        </Card>
      </Col>

      {mediaImages.length > 0 && (
        <Col span={24}>
          <Card
            title={<span style={{ color: "#1890ff" }}>Media Gallery</span>}
            bordered={false}
          >
            <Carousel autoplay>
              {mediaImages.map((url, index) => (
                <div key={index}>
                  <Image alt={`media image ${index + 1}`} src={url} height={300} />
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default PlaceDetails;
