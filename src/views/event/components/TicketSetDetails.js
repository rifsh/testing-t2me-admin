import React from "react";
import { Card, Typography } from "antd";
import { useSelector } from "react-redux";

const { Text } = Typography;

export const TicketSetDetails = () => {
  const { 
    selectedTicketStructure, 
    selectedTicketSet 
  } = useSelector((state) => state.tickets);

  // Early return if no ticket structure or ticket set is selected
  if (!selectedTicketStructure || !selectedTicketSet) return null;

  return (
    <Card 
      title="Selected Ticket Set Details" 
      bordered={false}
    >
      {selectedTicketSet.tickets.map((ticket, index) => (
        <div
          key={index}
          className="mb-4 flex justify-between items-center p-3 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all"
        >
          <Text 
            strong 
            className="text-base text-gray-700"
          >
            {ticket.name}
          </Text>
          <Text 
            className="text-base font-bold text-gray-900"
          >
            ${ticket.price}
          </Text>
        </div>
      ))}

      <div className="mt-4">
        <Text 
          strong 
          className="text-base text-gray-700 mr-2"
        >
          Total Tickets:
        </Text>
        <Text 
          className="text-base font-bold text-gray-900"
        >
          {selectedTicketSet.tickets.reduce(
            (total, ticket) => total + ticket.number_of_tickets,
            0
          )}
        </Text>
      </div>
    </Card>
  );
};