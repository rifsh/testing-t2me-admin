import React, { useEffect } from "react";
import { Card, Col, Form, Input, Row, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  resetAvailableTicketSets,
  setTicketValidationDialogVisible,
} from "store/slices/ticketSlice";
import { TicketTypeSelector } from "./TicketTypeSelector";
import { TicketStructureSelector } from "./TicketStructureSelector";
import { TicketSetDetails } from "./TicketSetDetails";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { setSelectedVenue } from "store/slices/locationSlice";
const { Option } = Select;
const TicketField = ({ form }) => {
  const dispatch = useDispatch();
  const { selectedVenue, selectedVenueList } = useSelector(
    (state) => state.locations
  );
  const {
    message,
    validationStatus,
    ticketValidationDialogVisible,
    ValidateData,
  } = useSelector((state) => state.tickets);

  useEffect(() => {
    // if (!selectedVenue || !selectedVenue?.id) {
    //   console.warn("No selected venue.");
    //   return;
    // }

    dispatch(getAvailableTicketsType());
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
  const handleVenueClick = async (value) => {
    const venue = selectedVenueList.find((venue) => venue.id === value);
    // await dispatch(setSelectedVenue(venue));
    if (value) {
      form.setFieldsValue({
        ticket_structure_id: null,
        ticket_set: null,
      });
      dispatch(resetAvailableTicketSets());
      dispatch(fetchAllTickets({ venue_id: value }));
    }

    if (venue?.capacity) {
      form.setFieldsValue({
        max_capacity: venue.capacity,
      });
    }
  };
  const handleValidationModalCancel = () => {
    dispatch(setTicketValidationDialogVisible(false));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Ticket Details">
          {/* Venue Selection */}
          <Form.Item
            name="venues"
            label="Selected Venues"
            rules={[{ required: true, message: "Please select a Venue." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Venue"
              value={selectedVenueList} // Fixed the value binding
              onChange={handleVenueClick} // Updated state when venue changes
            >
              {Array.isArray(selectedVenueList) &&
                selectedVenueList.map((venue) => (
                  <Option key={venue.id} value={venue.id}>
                    {venue.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
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

      <ValidationModal
        visible={ticketValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
      <TicketSetDetails />
    </Row>
  );
};

export default TicketField;
