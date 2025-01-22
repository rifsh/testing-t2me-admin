import React from "react";
import { Card, Typography, Divider, List, Col } from "antd";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export const TicketSetDetails = () => {
  const { selectedTicketStructure, selectedTicketSet } = useSelector(
    (state) => state.tickets
  );

  if (!selectedTicketStructure && !selectedTicketSet) return null;

  return (
    <Col xs={24} sm={24} md={7}>
      <Card bordered={true}>
        <div>
          <Title
            // level={5}
            style={{ margin: 0, color: "#2c3e50", fontSize: "16px" }}
          >
            {!selectedTicketSet && selectedTicketStructure
              ? "Selected Ticket Type"
              : "Selected Ticket Sub Type"}
          </Title>
          {!selectedTicketSet && selectedTicketStructure && (
            <List.Item
              style={{
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // background: "#f4f4f4",
              }}
            >
              <div>
                <Text strong style={{ fontSize: "14px", color: "#34495e" }}>
                  {selectedTicketStructure.name}
                </Text>
              </div>
              <div>
                <Text strong style={{ fontSize: "14px", color: "#34495e" }}>
                  {selectedTicketStructure.number_of_tickets} Tickets
                </Text>
              </div>
              <div>
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#2ecc71",
                  }}
                >
                  ${selectedTicketStructure.base_price.toFixed(2)}
                </Text>
              </div>
            </List.Item>
          )}

          {selectedTicketSet && (
            <>
              <Divider />
              <List
                dataSource={selectedTicketSet.tickets}
                renderItem={(ticket) => (
                  <List.Item
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      // background: "#f4f4f4",
                    }}
                  >
                    <div>
                      <Text
                        strong
                        style={{ fontSize: "14px", color: "#34495e" }}
                      >
                        {ticket.name}
                      </Text>
                    </div>
                    <div>
                      <Text
                        strong
                        style={{ fontSize: "14px", color: "#34495e" }}
                      >
                        {ticket.number_of_tickets} Tickets
                      </Text>
                    </div>
                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#2ecc71",
                        }}
                      >
                        ${ticket.price.toFixed(2)}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}
        </div>
      </Card>
    </Col>
  );
};

export default TicketSetDetails;
