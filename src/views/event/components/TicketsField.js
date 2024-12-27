import React, { useEffect } from "react";
import { Card, Col, Form, Input, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  setSelectedTicketSet,
} from "store/slices/ticketSlice";
import { TicketTypeSelector } from "./TicketTypeSelector";
import { TicketStructureSelector } from "./TicketStructureSelector";
import { TicketSetDetails } from "./TicketSetDetails";

const TicketField = ({ form }) => {
  const dispatch = useDispatch();
  const { selectedVenue } = useSelector((state) => state.locations);

  useEffect(() => {
    if (!selectedVenue || !selectedVenue?.id) {
      console.warn("No selected venue.");
      return;
    }

    dispatch(getAvailableTicketsType());
    dispatch(fetchAllTickets({ venue_id: selectedVenue.id }));

    if (selectedVenue?.capacity) {
      form.setFieldsValue({
        max_capacity: selectedVenue.capacity,
      });
    }
  }, [selectedVenue, form, dispatch]);

  const validateMaxTickets = (_, value) => {
    // if (!value) {
    //   return Promise.reject(
    //     new Error("Please enter the maximum number of tickets.")
    //   );
    // }
    // if (isNaN(value)) {
    //   return Promise.reject(new Error("Please enter a valid number."));
    // }
    if (value > selectedVenue.capacity) {
      return Promise.reject(
        new Error(
          `Max Ticket cannot exceed Max Capacity (${selectedVenue.capacity}).`
        )
      );
    }
    return Promise.resolve();
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Ticket Details">
          <Form.Item name="max_capacity" label="Max Capacity">
            <Input readOnly />
          </Form.Item>

          {/* <Form.Item
            name="max_tickets"
            label="Max Ticket"
            rules={[{ validator: validateMaxTickets }]}
          >
            <Input placeholder="Enter Max Ticket" type="number" />
          </Form.Item> */}

          <TicketTypeSelector form={form} />
          <TicketStructureSelector form={form} />
        </Card>
      </Col>
      <TicketSetDetails />
    </Row>
  );
};

export default TicketField;
