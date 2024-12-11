import { Card, Col, Form, Input, Select, Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  setSelectedTicketType,
} from "store/slices/ticketSlice";

const { Option } = Select;

const TicketField = ({ form }) => {
  const dispatch = useDispatch();
  const { availableTicketTyps, selectedTicketType, filteredTickets, loading } =
    useSelector((state) => state.tickets);
  const { selectedVenue } = useSelector((state) => state.locations);
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
  }, [selectedVenue, form]);

  const validateMaxTicket = (_, value) => {
    if (!value) {
      return Promise.reject(
        new Error("Please enter the maximum number of tickets.")
      );
    }
    if (isNaN(value)) {
      return Promise.reject(new Error("Please enter a valid number."));
    }
    if (value > selectedVenue.capacity) {
      return Promise.reject(
        new Error(
          `Max Ticket cannot exceed Max Capacity (${selectedVenue.capacity}).`
        )
      );
    }
    return Promise.resolve();
  };
  const handleSetTicktType = (type) => {
    dispatch(setSelectedTicketType(type));
  };
  return (
    <Col xs={24} sm={24} md={17}>
      <Card title="Ticket Details">
        <Form.Item name="max_capacity" label="Max Capacity">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          name="max_tickets"
          label="Max Ticket"
          rules={[{ validator: validateMaxTicket }]}
        >
          <Input placeholder="Enter Max Ticket" type="number" />
        </Form.Item>

        <Form.Item
          name="available_types"
          label="Type"
          rules={[{ required: true, message: "Please select a ticket type." }]}
        >
          <Select
            className="w-100"
            placeholder="Choose a Ticket Type"
            onSelect={(value) => handleSetTicktType(value)}
          >
            {availableTicketTyps?.available_types?.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedTicketType === "ticket_structure" ? (
          <Form.Item
            name="ticket_structure_id"
            label="Structure"
            rules={[{ required: true, message: "Please select a ticket." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket"
              loading={loading}
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : selectedTicketType === "seat_structure" ? (
          <Form.Item
            name="seat_structure_id"
            label="Seat Structure"
            rules={[{ required: true, message: "Please select a ticket." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket"
              loading={loading}
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : selectedTicketType === "movie_seat_structure" ? (
          <Form.Item
            name="movie_seat_structure_id"
            label="Movie Seat Structure"
            rules={[{ required: true, message: "Please select a ticket." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket"
              loading={loading}
            >
              {filteredTickets.map((ticket) => (
                <Option key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </Option>
              ))}   
            </Select>
          </Form.Item>
        ) : null}

        <Form.Item
          name="ticket_set"
          label="Set"
          rules={[{ required: true, message: "Please select a ticket." }]}
        >
          <Select
            className="w-100"
            placeholder="Choose a Ticket"
            loading={loading}
          >
            {filteredTickets.map((ticket) => (
              <Option key={ticket.id} value={/* ticket.id */ "Set1"}>
                {ticket.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default TicketField;
