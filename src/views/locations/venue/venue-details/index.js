import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Image,
  Carousel,
  Alert,
  Tag,
  Descriptions,
} from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector, useDispatch } from "react-redux";
import { getSingleVenues } from "store/slices/locationSlice";
import { CDN_PATH } from "configs/AppConfig";
import {
  EnvironmentOutlined,
  TeamOutlined,
  HomeOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import CDNImage from "components/layout-components/Image/CDNImage";

const { Title, Text } = Typography;

const VenueDetails = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("FETCHING SINGLE VENUE");

    const venueId = window.location.pathname.split("/").pop();
    if (venueId) {
      dispatch(getSingleVenues(venueId));
    }
  }, [dispatch]);

  const { singleVenues, loading, error } = useSelector(
    (state) => state.locations
  );
  console.log(singleVenues, "venue details");

  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singleVenues) return <div>No Venue Details Found</div>;

  const mediaItems = singleVenues.media || [];
  const isNoImage =
    !singleVenues.thumbnail_image || singleVenues.thumbnail_image === "images";

  return (
    <div style={{ padding: "20px" }}>
      {/* Header Section - Image and Key Info Side by Side */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            style={{ overflow: "hidden", borderRadius: "8px" }}
          >
            {isNoImage ? (
              <div
                style={{
                  height: 400,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  color: "#888",
                  fontSize: "18px",
                }}
              >
                No Image Available
              </div>
            ) : (
              <Image
                alt="venue thumbnail"
                src={`${CDN_PATH}/${singleVenues.thumbnail_image}`}
                height={400}
                style={{ width: "100%", objectFit: "cover" }}
                preview={false}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Title level={2} style={{ marginTop: 0, marginBottom: "16px" }}>
              {singleVenues.name}
            </Title>

            <Tag
              color={singleVenues.status ? "green" : "red"}
              style={{
                marginBottom: "20px",
                fontSize: "14px",
                padding: "4px 12px",
              }}
            >
              {singleVenues.status ? "Active" : "Inactive"}
            </Tag>

            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined /> Address
                  </span>
                }
              >
                {singleVenues.address || "Not Available"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <TeamOutlined /> Capacity
                  </span>
                }
              >
                <Text strong>{singleVenues.capacity || "Not Available"}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <HomeOutlined /> Indoor/Outdoor
                  </span>
                }
              >
                <Tag color={singleVenues.indoor ? "blue" : "green"}>
                  {singleVenues.indoor ? "Indoor" : "Outdoor"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <GlobalOutlined /> Location
                  </span>
                }
              >
                {singleVenues.place?.country?.name || "Not Available"}
              </Descriptions.Item>

              <Descriptions.Item label="Coordinates">
                {singleVenues.latitude && singleVenues.longitude
                  ? `${singleVenues.latitude}, ${singleVenues.longitude}`
                  : "Not Available"}
              </Descriptions.Item>

              <Descriptions.Item label="Place">
                {singleVenues.place?.name || "Not Available"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Description Section */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card
            title={<span style={{ color: "#1890ff" }}>Description</span>}
            bordered={false}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: singleVenues.description || "No description available",
              }}
              style={{ lineHeight: "1.8" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Venue Add-on Services */}
      {singleVenues.venue_add_on_services?.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card
              title={
                <span style={{ color: "#1890ff" }}>Venue Add-on Services</span>
              }
              bordered={false}
            >
              <Row gutter={[24, 24]}>
                {singleVenues.venue_add_on_services.map((service, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Card
                      size="small"
                      style={{
                        height: "100%",
                        borderLeft: "3px solid #1890ff",
                      }}
                    >
                      <Title
                        level={5}
                        style={{ marginBottom: 10, color: "#1890ff" }}
                      >
                        {service.title}
                      </Title>
                      <div>
                        {service.services.map((item, idx) => (
                          <Text
                            key={idx}
                            style={{ display: "block", marginBottom: 5 }}
                          >
                            • {item}
                          </Text>
                        ))}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Media Gallery */}
      {mediaItems.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card
              title={<span style={{ color: "#1890ff" }}>Media Gallery</span>}
              bordered={false}
            >
              <Carousel autoplay>
                {mediaItems.map((item, index) => (
                  <div key={index}>
                    {item.media_type === "image" ? (
                      <CDNImage
                        src={item.media_url}
                        alt={item.caption || `media image ${index + 1}`}
                        height={400}
                        style={{ width: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <video
                        controls
                        style={{
                          width: "100%",
                          height: "400px",
                          objectFit: "cover",
                          backgroundColor: "#000",
                        }}
                      >
                        <source
                          src={CDN_PATH + "/" + item.media_url}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {item.caption && (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "10px",
                          padding: "10px",
                        }}
                      >
                        <Text type="secondary">{item.caption}</Text>
                      </div>
                    )}
                  </div>
                ))}
              </Carousel>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default VenueDetails;
