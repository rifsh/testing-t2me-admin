import React, { useEffect } from "react";
import { Card, Row, Col, Typography, Alert, Carousel } from "antd";
import Loading from "components/shared-components/Loading";
import { useSelector, useDispatch } from "react-redux";
import {
  getSinglePlace,
} from "store/slices/locationSlice";
import { useParams } from "react-router-dom";
import CDNImage from "components/layout-components/Image/CDNImage";

const { Title, Text } = Typography;

const PlaceDetails = () => {
  const dispatch = useDispatch();
  const { placeId } = useParams();
  const { singlePlace, loading, error } = useSelector((state) => state.locations);

  useEffect(() => {
    console.log("FETCHING SINGLE PLACE");

    if (placeId) {
      dispatch(getSinglePlace(placeId))
    }
  }, [dispatch, placeId]);

  if (loading) return <Loading />;
  if (error) return <Alert message={`Error: ${error}`} type="error" />;
  if (!singlePlace) return <div>No place details found</div>;

  const mediaImages = singlePlace.media?.map((item) => item.media_url) || [];

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      <Col span={24}>
        <Card
          bordered={false}
          cover={
            <CDNImage
              src={singlePlace.thumbnail_image}
              alt="place thumbnail"
              height={300}
            />
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
            </Col>
            <Col span={12}>
              {/* Additional information can go here */}
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
                  <CDNImage
                    src={url}
                    alt={`media image ${index + 1}`}
                    height={300}
                  />
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