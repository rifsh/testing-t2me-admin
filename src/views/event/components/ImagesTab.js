import { Row, Col, Image, Empty } from "antd";
import CDNImage from "components/layout-components/Image/CDNImage";
import { CDN_PATH } from "configs/AppConfig";
import { useEffect } from "react";

const ImagesTab = ({ eventDetails }) => {
  useEffect(() => {
    console.log("eventdetailsimage logs", eventDetails?.event_images);

  }, [eventDetails])
  return (
    <div style={{ padding: "24px" }}>
      {eventDetails?.event_images?.length > 0 ? (
        <Row gutter={[24, 24]}>
          {eventDetails.event_images.map((img, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              {/* <Image
                src={`${CDN_PATH}/${img.image}`}
                alt="Event"
                width="100%"
                style={{ borderRadius: "8px" }}
              /> */}
              <CDNImage
                src={img.image}
                alt={`media image`}
                height={200}
                style={{ width: "100%", objectFit: "cover" }}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No images available"
          style={{ margin: "40px 0" }}
        />
      )}
    </div>
  );
};

export default ImagesTab;
