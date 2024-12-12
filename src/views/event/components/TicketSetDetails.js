import React from "react";
import { Card, Typography, Divider, List, Tag } from "antd";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export const TicketSetDetails = () => {
  const {
    selectedTicketStructure,
    selectedTicketSet,
  } = useSelector((state) => state.tickets);

  // Early return if no ticket structure or ticket set is selected
  if (!selectedTicketStructure || !selectedTicketSet) return null;

  // Calculate the total tickets
  const totalTickets = selectedTicketSet.tickets.reduce(
    (total, ticket) => total + ticket.number_of_tickets,
    0
  );

  // Calculate the total price
  const totalPrice = selectedTicketSet.tickets.reduce(
    (total, ticket) => total + ticket.price * ticket.number_of_tickets,
    0
  );

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0, color: "#2c3e50" }}>
          Selected Ticket Set Details
        </Title>
      }
      bordered={true}
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
              background: "#f9f9f9",
              marginBottom: "12px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong style={{ fontSize: "16px", color: "#34495e" }}>
                {ticket.name}
              </Text>
              <Tag color="blue" style={{ marginLeft: "8px" }}>
                {ticket.category || "General"}
              </Tag>
            </div>
            <div>
              <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#2ecc71" }}>
                ${ticket.price.toFixed(2)}
              </Text>
            </div>
          </List.Item>
        )}
      />

      <Divider dashed style={{ borderColor: "#bdc3c7" }} />

      <div style={{ textAlign: "right" }}>
        <div style={{ marginBottom: "8px" }}>
          <Text strong style={{ fontSize: "16px", color: "#7f8c8d" }}>
            Total Tickets:
          </Text>
          <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#34495e" }}>
            {` ${totalTickets}`}
          </Text>
        </div>
        <div>
          <Text strong style={{ fontSize: "16px", color: "#7f8c8d" }}>
            Total Price:
          </Text>
          <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#e74c3c" }}>
            {` $${totalPrice.toFixed(2)}`}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default TicketSetDetails;