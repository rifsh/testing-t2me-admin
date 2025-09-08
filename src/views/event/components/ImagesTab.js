import { Row, Col, Image, Empty } from "antd";
import { CDN_PATH } from "configs/AppConfig";

const ImagesTab = ({ eventDetails }) => {
  return (
    <div style={{ padding: "24px" }}>
      {eventDetails?.event_images?.length > 0 ? (
        <Row gutter={[24, 24]}>
          {eventDetails.event_images.map((img, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Image
                src={`${CDN_PATH}/${img.image}`}
                alt="Event"
                width="100%"
                style={{ borderRadius: "8px" }}
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
