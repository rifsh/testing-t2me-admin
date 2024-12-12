import { Card, Col, Form, Input, Row, Select, Typography, message } from "antd";
import TicketMockData from "mock/data/ticketData";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  setSelectedTicketType,
} from "store/slices/ticketSlice";

const { Option } = Select;
const { Text } = Typography;

const TicketField = ({ form }) => {
  const dispatch = useDispatch();
  const { availableTicketTyps, selectedTicketType, filteredTickets, loading } =
    useSelector((state) => state.tickets);
  const { selectedVenue } = useSelector((state) => state.locations);

  const [availableSets,setavailableSets] = useState();
  const [selectedTicketSet, setSelectedTicketSet] = useState(null); 

  useEffect(() => {
    if (selectedVenue?.id) {
      dispatch(getAvailableTicketsType());
      dispatch(fetchAllTickets(selectedVenue.id));
    }
    if (selectedVenue?.capacity) {
      form.setFieldsValue({
        max_capacity: selectedVenue.capacity,
      });
    }
  }, [selectedVenue, form, dispatch]);

  const handleSetTicketType = (value) => {
    try {
      console.log("Handling ticket type selection:", value);
      dispatch(setSelectedTicketType(value));
    } catch (error) {
      console.error("Error setting ticket type:", error);
      message.error("Failed to set ticket type");
    }
  };

  const handleSelectTicketSet = (setName) => {
    const selectedSet = availableSets.find((set) => set.set_name === setName);
    setSelectedTicketSet(selectedSet);
  };

  const renderTicketTypeFields = () => {
    console.log("Current selected ticket type:", selectedTicketType);

    switch (selectedTicketType) {
      case 2:
        return (
          <Form.Item
            name="ticket_structure_id"
            label="Structure"
            rules={[
              { required: true, message: "Please select a ticket structure." },
            ]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket Structure"
              loading={loading}
             
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}  onSelect={availableSets(ticket.ticket_types)} >
                  {ticket.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 1:
        return (
          <Form.Item
            name="seat_structure_id"
            label="Seat Structure"
            rules={[
              { required: true, message: "Please select a seat structure." },
            ]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Seat Structure"
              loading={loading}
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 3:
        return (
          <Form.Item
            name="movie_seat_structure_id"
            label="Movie Seat Structure"
            rules={[
              {
                required: true,
                message: "Please select a movie seat structure.",
              },
            ]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Movie Seat Structure"
              loading={loading}
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Row justify={"space-between"}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Ticket Details">
          <Form.Item name="max_capacity" label="Max Capacity">
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="max_tickets"
            label="Max Ticket"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Please enter the maximum number of tickets.")
                    );
                  }
                  if (isNaN(value)) {
                    return Promise.reject(
                      new Error("Please enter a valid number.")
                    );
                  }
                  if (value > selectedVenue.capacity) {
                    return Promise.reject(
                      new Error(
                        `Max Ticket cannot exceed Max Capacity (${selectedVenue.capacity}).`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter Max Ticket" type="number" />
          </Form.Item>

          <Form.Item
            name="available_types"
            label="Type"
            rules={[
              { required: true, message: "Please select a ticket type." },
            ]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket Type"
              value={selectedTicketType}
              onChange={handleSetTicketType}
            >
              {availableTicketTyps?.available_types?.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Dynamically rendered ticket type specific fields */}
          {selectedTicketType && renderTicketTypeFields()}

          <Form.Item
            name="ticket_set"
            label="Ticket Set"
            rules={[{ required: true, message: "Please select a ticket set." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket Set"
              loading={loading}
              onChange={handleSelectTicketSet}
            >
              {/* {availableSets.map((ticket) => (
                <Option key={ticket.ticket_set} value={ticket.ticket_set}>
                  {ticket.set_name}
                </Option>
              ))} */}
            </Select>
          </Form.Item>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={7} style={{ paddingLeft: "15px" }}>
        {selectedTicketSet && (
          <Card title="Selected Ticket Set Details" bordered={false}>
            {selectedTicketSet.tickets.map((ticket, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9", // Light background for each ticket
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                  transition: "transform 0.2s, box-shadow 0.2s", // Smooth transitions
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)"; // Slight scale effect on hover
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.2)"; // Enhance shadow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"; // Reset scale
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0, 0, 0, 0.1)"; // Reset shadow
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: "#555", // Light grey for the ticket name
                    textTransform: "capitalize",
                    fontWeight: "600", // Slightly bolder text for prominence
                  }}
                >
                  {ticket.name}
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#333", // Darker color for price for contrast
                    fontWeight: "700", // Bolder for better visibility
                  }}
                >
                  ${ticket.price}
                </Text>
              </div>
            ))}

            <div style={{ marginBottom: "15px" }}>
              <Text
                strong
                style={{
                  fontSize: "16px",
                  color: "#555", // Light grey for total tickets label
                  fontWeight: "600", // Bolder to maintain hierarchy
                }}
              >
                Total Tickets:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "700", // Bolder total ticket count
                  color: "#333", // Darker color for total tickets count
                }}
              >
                {selectedTicketSet.tickets.reduce(
                  (total, ticket) => total + ticket.number_of_tickets,
                  0
                )}
              </Text>
            </div>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default TicketField;
