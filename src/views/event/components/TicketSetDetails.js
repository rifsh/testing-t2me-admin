import React from "react";
import { Card, Typography, Divider, List, Tag, Col } from "antd";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export const TicketSetDetails = () => {
  const { selectedTicketStructure, selectedTicketSet } = useSelector(
    (state) => state.tickets
  );

  if (!selectedTicketStructure || !selectedTicketSet) return null;

  const totalTickets = selectedTicketSet.tickets.reduce(
    (total, ticket) => total + ticket.number_of_tickets,
    0
  );

  const totalPrice = selectedTicketSet.tickets.reduce(
    (total, ticket) => total + ticket.price * ticket.number_of_tickets,
    0
  );

  return (
    <Col xs={24} sm={24} md={7}>
      <Card
        title={
          <Title level={5} style={{ margin: 0, color: "#2c3e50" }}>
            Ticket Set Details
          </Title>
        }
        bordered={true}
        style={{
          // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <List
          dataSource={selectedTicketSet.tickets}
          renderItem={(ticket) => (
            <List.Item
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "#e2f0f0",
                marginBottom: "12px",
                // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong style={{ fontSize: "16px", color: "#34495e" }}>
                  {ticket.name}
                </Text>
              </div>
              <div>
                <Text
                  style={{
                    fontSize: "16px",
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
      </Card>
    </Col>
  );
};

export default TicketSetDetails;
