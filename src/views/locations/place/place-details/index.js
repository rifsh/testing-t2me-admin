import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Carousel,
  Descriptions,
  Tag,
} from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector, useDispatch } from "react-redux";
import { getSinglePlace } from "store/slices/locationSlice";
import { useParams } from "react-router-dom";
import CDNImage from "components/layout-components/Image/CDNImage";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { CDN_PATH } from "configs/AppConfig";

const { Title, Text } = Typography;

const PlaceDetails = () => {
  const dispatch = useDispatch();
  const { placeId } = useParams();
  const { singlePlace, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    console.log("FETCHING SINGLE PLACE");

    if (placeId) {
      dispatch(getSinglePlace(placeId));
    }
  }, [dispatch, placeId]);

  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singlePlace) return <div>No place details found</div>;

  const mediaItems = singlePlace.media || [];

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
            <CDNImage
              src={singlePlace.thumbnail_image}
              alt="place thumbnail"
              height={400}
              style={{ width: "100%", objectFit: "cover" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ height: "100%" }}>
            <Title level={2} style={{ marginTop: 0, marginBottom: "16px" }}>
              {singlePlace.name}
            </Title>

            <Tag
              color={singlePlace.status ? "green" : "red"}
              style={{
                marginBottom: "20px",
                fontSize: "14px",
                padding: "4px 12px",
              }}
            >
              {singlePlace.status ? "Active" : "Inactive"}
            </Tag>

            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined /> Country
                  </span>
                }
              >
                <Text strong>{singlePlace.country?.name || "N/A"}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <ClockCircleOutlined /> Time Zone
                  </span>
                }
              >
                {singlePlace.country?.time_zone || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <DollarOutlined /> Currency
                  </span>
                }
              >
                {singlePlace.country?.currency_code || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Coordinates">
                {singlePlace.latitude && singlePlace.longitude
                  ? `${singlePlace.latitude}, ${singlePlace.longitude}`
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Created">
                {singlePlace.created_at
                  ? new Date(singlePlace.created_at).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Last Updated">
                {singlePlace.updated_at
                  ? new Date(singlePlace.updated_at).toLocaleDateString()
                  : "N/A"}
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
                __html: singlePlace.description || "No description available",
              }}
              style={{ lineHeight: "1.8" }}
            />
          </Card>
        </Col>
      </Row>

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

export default PlaceDetails;
