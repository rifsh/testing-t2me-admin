import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Image, Carousel, Alert } from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getSingleVenues,
} from "store/slices/locationSlice";
const { Title, Text } = Typography;


const VenueDetails = () => {
  const dispatch = useDispatch();
  const { venueId } = useParams();

  useEffect(() => {
    console.log("FETCHING SINGLE VENUE");

    if (venueId) {
      dispatch(getSingleVenues(venueId))
    }
  }, [dispatch, venueId]);
  const { singleVenues, loading, error } = useSelector(
    (state) => state.locations
  );



  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singleVenues) return <div>No Venue Details Found</div>;

  const mediaImages = singleVenues.media?.map((item) => item.media_url) || [];

  const isNoImage =
    !singleVenues.thumbnail_image || singleVenues.thumbnail_image === "images";

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
                alt="venue thumbnail"
                src={singleVenues.thumbnail_image}
                height={300}
                style={{ objectFit: "cover" }}
              />
            )
          }
        >
          <Title level={2} style={{ margin: "10px 0" }}>
            {singleVenues.name}
          </Title>
          <Text>{singleVenues.place?.country?.name}</Text>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={<span style={{ color: "#1890ff" }}>Venue Overview</span>} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Address:</Text> {singleVenues.address || "Not Available"}
            </Col>
            <Col span={12}>
              <Text strong>Capacity:</Text> {singleVenues.capacity || "Not Available"}
            </Col>
            <Col span={12}>
              <Text strong>Indoor:</Text> {singleVenues.indoor ? "Yes" : "No"}
            </Col>
            <Col span={12}>
              <Text strong>Latitude:</Text> {singleVenues.latitude || "Not Available"}
            </Col>
            <Col span={12}>
              <Text strong>Longitude:</Text> {singleVenues.longitude || "Not Available"}
            </Col>
            <Col span={12}>
              <Text strong>Description:</Text> {singleVenues.description || "Not Available"}
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24}>
        {/* Event Add on Services Section */}
        <Card title={<span style={{ color: "#1890ff" }}>Event Add on Services</span>} bordered={false}>
          <Row gutter={[24, 24]} justify="left">
            {singleVenues.venue_add_on_services?.length > 0 ? (
              singleVenues.venue_add_on_services.map((service, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>

                  <div>
                    <Title level={5} style={{ marginBottom: 10 }}>{service.title}</Title>

                    <div style={{ textAlign: "left" }}>
                      {service.services.map((item, idx) => (
                        <Text key={idx} style={{ display: "block", marginBottom: 5 }}>
                          • {item}
                        </Text>
                      ))}
                    </div>
                  </div>

                </Col>
              ))
            ) : (
              <Col span={24} style={{ textAlign: "center" }}>
                <Text>No Add on Services Available</Text>
              </Col>
            )}
          </Row>
        </Card>
      </Col>

      {mediaImages.length > 0 && (
        <Col span={24}>
          <Card title={<span style={{ color: "#1890ff" }}>Media Gallery</span>} bordered={false}>
            <Carousel autoplay autoplaySpeed={3000}>
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

export default VenueDetails;
