import { Row, Col, Card, Typography, Empty } from "antd";

const { Text } = Typography;

const FaqTab = ({ eventDetails }) => {
  return (
    <div style={{ padding: "24px" }}>
      {eventDetails?.event_qna?.length > 0 ? (
        <Row gutter={[24, 24]} justify="start">
          {eventDetails.event_qna.map((qna, index) => (
            <Col xs={24} sm={12} key={index}>
              <Card
                title={qna.title}
                style={{
                  height: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
                headStyle={{
                  fontSize: "16px",
                  fontWeight: "600",
                  backgroundColor: "#f8fcff",
                  borderBottom: "1px solid #e6f7ff",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  {qna.qna.map((qa, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "20px",
                        borderBottom:
                          idx < qna.qna.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        paddingBottom: "16px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: "#333",
                          fontSize: "15px",
                        }}
                      >
                        <span style={{ color: "#1890ff", marginRight: "8px" }}>
                          Q:
                        </span>{" "}
                        {qa.question}
                      </Text>
                      <Text
                        style={{
                          display: "block",
                          marginLeft: "24px",
                          color: "#555",
                          fontSize: "14px",
                        }}
                      >
                        <span style={{ color: "#52c41a", marginRight: "8px" }}>
                          A:
                        </span>{" "}
                        {qa.answer}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No Q&A available for this event"
          style={{ margin: "40px 0" }}
        />
      )}
    </div>
  );
};

export default FaqTab;
