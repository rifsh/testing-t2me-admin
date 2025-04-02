import { Row, Col, Card, Typography, Empty } from "antd";

const { Title, Text } = Typography;

const ServicesTab = ({ eventDetails }) => {
    return (
        <div style={{ padding: "24px" }}>
            {eventDetails?.event_add_on_services?.length > 0 ? (
                <Row gutter={[24, 24]} justify="start">
                    {eventDetails.event_add_on_services.map((service, index) => (
                        <Col key={index}>
                            <Card
                                hoverable
                                style={{
                                    height: "100%",
                                    borderRadius: "12px",
                                    backgroundColor: "#f8fcff",
                                    border: "1px solid #e6f7ff",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                                }}
                                bodyStyle={{ padding: "20px" }}
                            >
                                <div style={{ marginBottom: "8px", color: "#1890ff" }}>
                                    <span role="img" aria-label="service" style={{ fontSize: "24px" }}>🛍️</span>
                                </div>
                                <Title level={5} style={{ marginBottom: "16px", color: "#333" }}>
                                    {service.title}
                                </Title>
                                <div style={{ textAlign: "left" }}>
                                    {service.services.map((item, idx) => (
                                        <Text key={idx} style={{ display: "block", marginBottom: "8px", color: "#555" }}>
                                            <span style={{ color: "#1890ff", marginRight: "8px" }}>•</span> {item}
                                        </Text>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No additional services available for this event" style={{ margin: "40px 0" }} />
            )}
        </div>
    );
};

export default ServicesTab;
