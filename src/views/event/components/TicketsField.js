import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Select, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  resetAvailableTicketSets,
  setSelectedTicketType,
  setTicketValidationDialogVisible,
} from "store/slices/ticketSlice";
import { TicketTypeSelector } from "./TicketTypeSelector";
import { TicketStructureSelector } from "./TicketStructureSelector";
import { TicketSetDetails } from "./TicketSetDetails";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { setSelectedVenue } from "store/slices/locationSlice";
import { getEventAllSeatStructures } from "store/slices/movieSeatSlice";
import { setavailableSeats } from "store/slices/eventSlice";
const { Option } = Select;
const TicketField = ({ form }) => {
  const dispatch = useDispatch();
  const { selectedVenueList } = useSelector((state) => state.locations);
  const {
    message,
    validationStatus,
    ticketValidationDialogVisible,
    ValidateData,
    selectedTicketType,
  } = useSelector((state) => state.tickets);
  const { allSeats, loading } = useSelector((state) => state.movieSeatSlice);
  const { availableSeats } = useSelector((state) => state.event);
  const [selectedVenue, setSelectedVenue] = useState();
  const [selectedBookingType, setSelectedBookingType] = useState();
  useEffect(() => {
    // if (!selectedVenue || !selectedVenue?.id) {
    //   console.warn("No selected venue.");
    //   return;
    // }

    dispatch(getAvailableTicketsType());
  }, [form, dispatch]);

  const handleRemoveSeat = (seatId) => {
    const updatedSeats = availableSeats.filter((seat) => seat.id !== seatId);
    dispatch(setavailableSeats(updatedSeats));

    const currentFormValues = form.getFieldValue("available_seats") || [];

    const updatedFormValues = currentFormValues.filter((id) => id !== seatId);

    form.setFieldsValue({
      available_seats: updatedFormValues,
    });
  };

  const handleSetSeats = (selectedSeatIds) => {
    if (!allSeats) return;

    const seatsWithVenueInfo = allSeats
      .filter((seat) => selectedSeatIds.includes(seat.id))
      .map((seat) => ({
        ...seat,
        venue_name: selectedVenue?.name || "Unknown Venue",
        venue_id: selectedVenue?.id,
      }));

    const seatsFromOtherVenues = availableSeats.filter(
      (seat) => seat.venue_id !== selectedVenue?.id
    );
    const updatedSeats = [...seatsFromOtherVenues, ...seatsWithVenueInfo];

    dispatch(setavailableSeats(updatedSeats));
  };
  const handleVenueClick = async (value) => {
    const venue = selectedVenueList.find((venue) => venue.id === value);
    setSelectedVenue(venue);

    if (value) {
      form.setFieldsValue({
        ticket_structure_id: null,
        ticket_set: null,
      });

      if (selectedBookingType === 1) {
        dispatch(getEventAllSeatStructures({ venue_id: value }));

        form.setFieldsValue({
          available_seats: [],
        });
      } else {
        dispatch(resetAvailableTicketSets());
        dispatch(fetchAllTickets({ venue_id: value }));
      }
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

  const handleSetTicketType = (value) => {
    form.setFieldsValue({
      seat_structure_id: null,
      ticket_structure_id: null,
      ticket_set: null,
    });
    dispatch(setSelectedTicketType(value));
    setSelectedBookingType(value);
    if (value === 1) {
      dispatch(getEventAllSeatStructures({ venue_id: selectedVenue.id }));
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Ticket Details">
          <Form.Item
            name="venues"
            label="Selected Venues"
            rules={[{ required: true, message: "Please select a Venue." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Venue"
              value={selectedVenueList}
              onChange={handleVenueClick}
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

          <TicketTypeSelector
            form={form}
            handleSetTicketType={handleSetTicketType}
          />

          {selectedTicketType && selectedTicketType === 1 ? (
            <Form.Item
              name="available_seats"
              label="Available Seats"
              rules={[
                { required: true, message: "Please select at least one seat." },
              ]}
            >
              <Select
                className="w-100"
                placeholder="Choose seats"
                onChange={handleSetSeats}
                loading={loading}
                mode="multiple"
                maxTagCount={3}
                showSearch
                optionFilterProp="children"
              >
                {allSeats?.map((seat) => (
                  <Option key={seat.id} value={seat.id}>
                    {seat.name} ({seat.total_seats} seats)
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <TicketStructureSelector form={form} />
          )}
        </Card>
      </Col>

      <ValidationModal
        visible={ticketValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />

      {selectedTicketType && selectedTicketType === 1 ? (
        <Col xs={24} sm={24} md={7}>
          <Card title={`Selected Seats (${availableSeats.length} total)`}>
            <div
              className="space-y-2"
              style={{ overflow: "auto", maxHeight: "70vh" }}
            >
              {availableSeats.length > 0 ? (
                availableSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="p-3 rounded-xl border flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{seat.name}</div>
                      <div className="text-xs text-gray-500">
                        Total Seats: {seat.total_seats}
                      </div>
                      {seat.venue_name && (
                        <Tag color="green" className="mt-1">
                          {seat.venue_name}
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: seat.color }}
                      />
                      <div className="flex flex-wrap gap-1">
                        {seat.seat_data?.seatTypes?.map((item) => (
                          <Tag key={item.value} color="blue">
                            {item.label}
                          </Tag>
                        ))}
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleRemoveSeat(seat.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Select seats to display them here
                </div>
              )}
            </div>
            {availableSeats.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button danger onClick={() => dispatch(setavailableSeats([]))}>
                  Clear All Seats
                </Button>
              </div>
            )}
          </Card>
        </Col>
      ) : (
        <TicketSetDetails />
      )}
    </Row>
  );
};

export default TicketField;
