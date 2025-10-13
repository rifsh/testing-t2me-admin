import React, { useEffect, useState, useCallback } from "react";
import * as antd from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTickets } from "store/slices/ticketSlice";
import { getEventAllSeatStructures } from "store/slices/movieSeatSlice";
import { setEventFormData } from "store/slices/eventSlice";
import { EDIT } from "constants/AppConstants";

const {
  Row,
  Col,
  Card,
  Form,
  Select,
  Typography,
  Tabs,
  List,
  Space,
  Checkbox,
  Button,
  Spin,
  message,
} = antd;
const { Option } = Select;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

const TicketSelectionField = ({ form, currentValues, mode }) => {
  const dispatch = useDispatch();

  const venues = currentValues.venue_id || [];

  const selectedSeats = Form.useWatch("selected_seats", form) || {};
  const selectedTicketTypes =
    Form.useWatch("selected_ticket_types", form) || {};
  const ticketSets = Form.useWatch("ticket_sets", form) || {};
  const ticketQuantities = Form.useWatch("ticket_quantities", form) || {};

  const [activeVenueTab, setActiveVenueTab] = useState(null);
  const [activeTicketTypeTab, setActiveTicketTypeTab] = useState({});
  const [fetchedVenues, setFetchedVenues] = useState(new Set());
  const [venueData, setVenueData] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const { filteredTickets, loading: ticketLoading } = useSelector(
    (state) => state.tickets
  );
  const { allSeats, loading: seatsLoading } = useSelector(
    (state) => state.movieSeatSlice
  );
  const { filteredVenues } = useSelector((state) => state.locations);
  const { eventDetails } = useSelector((state) => state.event);

  // Load ticket structure data into form fields on mount
  useEffect(() => {
    if (
      eventDetails?.venue_ticket_structures &&
      !dataLoaded &&
      venues.length > 0
    ) {
      const selectedTicketTypesData = {};
      const ticketSetsData = {};

      eventDetails.venue_ticket_structures.forEach((vts) => {
        const venueId = vts.venue.id;
        const ticketStructures = vts.ticket_structures || [];

        if (ticketStructures.length > 0) {
          selectedTicketTypesData[venueId] = ticketStructures.map(
            (ts) => ts.ticket_structure
          );

          ticketSetsData[venueId] = {};
          ticketStructures.forEach((ts) => {
            if (ts.ticket_sets && Array.isArray(ts.ticket_sets)) {
              ticketSetsData[venueId][ts.ticket_structure] = ts.ticket_sets;
            }
          });
        }
      });

      // Update form with loaded data
      form.setFieldValue("selected_ticket_types", selectedTicketTypesData);
      form.setFieldValue("ticket_sets", ticketSetsData);
      form.setFieldValue("selected_seats", {});
      form.setFieldValue("ticket_quantities", {});

      dispatch(
        setEventFormData({
          selected_ticket_types: selectedTicketTypesData,
          ticket_sets: ticketSetsData,
          selected_seats: {},
          ticket_quantities: {},
        })
      );

      setDataLoaded(true);
    }
  }, [eventDetails, dataLoaded, venues, form, dispatch]);

  useEffect(() => {
    const currentFormValues = form.getFieldsValue();

    const initializeField = (fieldName, defaultValue = {}) => {
      if (
        !currentFormValues[fieldName] ||
        Object.keys(currentFormValues[fieldName]).length === 0
      ) {
        form.setFieldValue(fieldName, defaultValue);
      }
    };

    initializeField("selected_seats");
    initializeField("selected_ticket_types");
    initializeField("ticket_sets");
    initializeField("ticket_quantities");
  }, [form]);

  useEffect(() => {
    if (activeVenueTab) {
      const venueId = parseInt(activeVenueTab);

      const venueTickets = Array.isArray(filteredTickets)
        ? filteredTickets.filter((ticket) => ticket.venue?.id === venueId)
        : [];

      const venueSeatStructures = Array.isArray(allSeats)
        ? allSeats.filter((seat) => seat.venue.id === venueId)
        : [];

      if (venueTickets.length > 0 || venueSeatStructures.length > 0) {
        setVenueData((prev) => ({
          ...prev,
          [venueId]: {
            tickets: venueTickets,
            seatStructures: venueSeatStructures,
          },
        }));
      }
    }
  }, [activeVenueTab, filteredTickets, allSeats]);

  useEffect(() => {
    if (venues.length > 0 && !activeVenueTab) {
      setActiveVenueTab(venues[0].toString());
    } else if (venues.length === 0) {
      setActiveVenueTab(null);
      setVenueData({});
      setFetchedVenues(new Set());
    } else if (activeVenueTab && !venues.includes(parseInt(activeVenueTab))) {
      setActiveVenueTab(venues[0]?.toString() || null);
    }
  }, [venues, activeVenueTab]);

  useEffect(() => {
    if (activeVenueTab && venues.includes(parseInt(activeVenueTab))) {
      const venueId = parseInt(activeVenueTab);

      if (!fetchedVenues.has(venueId)) {
        dispatch(getEventAllSeatStructures({ venue_id: venueId }));
        dispatch(fetchAllTickets({ venue_id: venueId }));
        setFetchedVenues((prev) => new Set([...prev, venueId]));
      }
    }
  }, [activeVenueTab, dispatch, venues, fetchedVenues]);

  const handleVenueTabChange = useCallback((activeKey) => {
    setActiveVenueTab(activeKey);
  }, []);

  // Helper function to check if seat was already submitted
  const isSubmittedSeat = (venueId, seatId) => {
    if (mode === EDIT && eventDetails?.venue_ticket_structures) {
      const venueStructure = eventDetails.venue_ticket_structures.find(
        (vts) => vts.venue.id === venueId
      );

      if (venueStructure?.ticket_structures) {
        const submittedSeats = venueStructure.ticket_structures.flatMap(
          (ts) => ts.submitted_seats || []
        );

        return submittedSeats.includes(seatId);
      }
    }
    return false;
  };

  // Helper function to check if ticket set was already submitted
  const isSubmittedTicketSet = (venueId, ticketSetId) => {
    if (mode === EDIT && eventDetails?.venue_ticket_structures) {
      const venueStructure = eventDetails.venue_ticket_structures.find(
        (vts) => vts.venue.id === venueId
      );

      if (venueStructure?.ticket_structures) {
        const submittedSets = venueStructure.ticket_structures.flatMap((ts) =>
          ts.ticket_sets ? ts.ticket_sets.map((set) => set) : []
        );

        return submittedSets.includes(ticketSetId);
      }
    }
    return false;
  };

  // Helper function to check if ticket type was already submitted
  const isSubmittedTicketType = (venueId, ticketTypeId) => {
    if (mode === EDIT && eventDetails?.venue_ticket_structures) {
      const venueStructure = eventDetails.venue_ticket_structures.find(
        (vts) => vts.venue.id === venueId
      );

      if (venueStructure?.ticket_structures) {
        const submittedIds = venueStructure.ticket_structures.map(
          (ts) => ts.ticket_structure
        );

        return submittedIds.includes(ticketTypeId);
      }
    }
    return false;
  };

  const handleSeatSelection = (venueId, seatId, checked) => {
    const currentSeats = form.getFieldValue("selected_seats") || {};
    const venueSeats = currentSeats[venueId] || {};

    const updatedSeats = {
      ...currentSeats,
      [venueId]: {
        ...venueSeats,
        [seatId]: checked,
      },
    };

    form.setFieldValue("selected_seats", updatedSeats);
    dispatch(setEventFormData({ selected_seats: updatedSeats }));
  };

  const handleSeatDeselect = (venueId, seatId) => {
    if (isSubmittedSeat(venueId, seatId)) {
      message.error("This seat is already submitted and cannot be removed");
      return false;
    }
    return true;
  };

  const handleTicketTypeSelection = (venueId, selectedTypes) => {
    const currentTypes = form.getFieldValue("selected_ticket_types") || {};

    const updatedTypes = {
      ...currentTypes,
      [venueId]: selectedTypes,
    };

    form.setFieldValue("selected_ticket_types", updatedTypes);
    dispatch(setEventFormData({ selected_ticket_types: updatedTypes }));
  };

  const handleTicketSetSelection = (venueId, ticketTypeId, ticketSetIds) => {
    const currentSets = form.getFieldValue("ticket_sets") || {};
    const venueSets = currentSets[venueId] || {};

    const updatedSets = {
      ...currentSets,
      [venueId]: {
        ...venueSets,
        [ticketTypeId]: ticketSetIds,
      },
    };

    form.setFieldValue("ticket_sets", updatedSets);
    dispatch(setEventFormData({ ticket_sets: updatedSets }));
  };

  useEffect(() => {
    const formData = {
      selected_ticket_types: selectedTicketTypes,
      selected_seats: selectedSeats,
      ticket_sets: ticketSets,
      ticket_quantities: ticketQuantities,
    };

    if (
      Object.keys(formData.selected_ticket_types || {}).length > 0 ||
      Object.keys(formData.selected_seats || {}).length > 0 ||
      Object.keys(formData.ticket_sets || {}).length > 0
    ) {
      dispatch(setEventFormData(formData));
    }
  }, [
    selectedTicketTypes,
    selectedSeats,
    ticketSets,
    ticketQuantities,
    dispatch,
  ]);

  const renderSeatSelection = (venueId) => {
    const currentVenueData = venueData[venueId];
    const venueSeatData = currentVenueData?.seatStructures || [];

    if (
      seatsLoading &&
      (!currentVenueData || !currentVenueData.seatStructures?.length)
    ) {
      return (
        <Card title="Seat Selection" size="small" style={{ marginBottom: 16 }}>
          <Spin />
        </Card>
      );
    }

    if (venueSeatData.length === 0) {
      return (
        <Card title="Seat Selection" size="small" style={{ marginBottom: 16 }}>
          <Text type="secondary">
            No seat structures available for this venue.
          </Text>
        </Card>
      );
    }

    return (
      <Card title="Seat Selection" size="small" style={{ marginBottom: 16 }}>
        <List
          dataSource={venueSeatData}
          renderItem={(seat) => {
            const isSubmitted = isSubmittedSeat(venueId, seat.id);
            const isChecked = selectedSeats[venueId]?.[seat.id] || false;

            return (
              <List.Item>
                <Checkbox
                  checked={isChecked}
                  disabled={isSubmitted && isChecked}
                  onChange={(e) => {
                    if (
                      !e.target.checked &&
                      !handleSeatDeselect(venueId, seat.id)
                    ) {
                      return;
                    }
                    handleSeatSelection(venueId, seat.id, e.target.checked);
                  }}
                >
                  <Space>
                    <Text strong>{seat.name}</Text>
                    <Text>Total Seats: {seat.total_seats}</Text>
                    {isSubmitted && isChecked && (
                      <Text type="warning">(Submitted)</Text>
                    )}
                    {seat.seat_data?.seatTypes &&
                      Array.isArray(seat.seat_data.seatTypes) &&
                      seat.seat_data.seatTypes.map((type) => (
                        <Text key={type.value} type="secondary">
                          {type.label}
                        </Text>
                      ))}
                  </Space>
                </Checkbox>
              </List.Item>
            );
          }}
        />
      </Card>
    );
  };

  const renderTicketSetSelection = (venueId, ticketTypeId, ticketTypeName) => {
    const currentVenueData = venueData[venueId];
    const ticketType = currentVenueData?.tickets?.find(
      (t) => t.id === ticketTypeId
    );

    const ticketSetsForType = ticketType?.ticket_types || [];

    if (!ticketSetsForType.length) {
      return (
        <Card size="small">
          <Text type="secondary">
            No ticket sets available for {ticketTypeName}
          </Text>
        </Card>
      );
    }

    return (
      <Card size="small">
        <Form.Item
          label={`Select ticket sets for ${ticketTypeName}`}
          style={{ marginBottom: 0 }}
        >
          <Select
            mode="multiple"
            placeholder="Select ticket sets"
            style={{ width: "100%" }}
            onChange={(value) => {
              const currentValue = ticketSets[venueId]?.[ticketTypeId] || [];

              if (value.length < currentValue.length) {
                const removed = currentValue.find(
                  (item) => !value.includes(item)
                );

                if (
                  removed &&
                  !handleTicketSetDeselect(venueId, removed, ticketTypeId)
                ) {
                  form.setFieldValue(
                    ["ticket_sets", venueId, ticketTypeId],
                    currentValue
                  );
                  return;
                }
              }

              handleTicketSetSelection(venueId, ticketTypeId, value);
            }}
            onDeselect={(deselectedValue) => {
              if (
                !handleTicketSetDeselect(venueId, deselectedValue, ticketTypeId)
              ) {
                return;
              }
            }}
            value={ticketSets[venueId]?.[ticketTypeId] || []}
          >
            {ticketSetsForType.map((setData, index) => {
              const isSubmitted = isSubmittedTicketSet(
                venueId,
                setData.ticket_set
              );
              const isSelected =
                ticketSets[venueId]?.[ticketTypeId]?.includes(
                  setData.ticket_set
                ) || false;

              return (
                <Option
                  key={`${setData.ticket_set}-${index}`}
                  value={setData.ticket_set}
                  disabled={isSubmitted && isSelected}
                >
                  <Space>
                    <Text>{setData.ticket_set}</Text>
                    <Text type="secondary">
                      {Array.isArray(setData.tickets)
                        ? setData.tickets.length
                        : 0}{" "}
                      tickets
                    </Text>
                    <Text type="secondary">
                      Price: {setData.tickets?.[0]?.price || "N/A"}
                    </Text>
                    {isSubmitted && isSelected && (
                      <Text type="warning">(Submitted)</Text>
                    )}
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Card>
    );
  };

  const handleTicketSetDeselect = (venueId, deselectedValue, ticketTypeId) => {
    if (isSubmittedTicketSet(venueId, deselectedValue)) {
      message.error(
        "This ticket set is already submitted and cannot be removed"
      );
      return false;
    }
    return true;
  };

  const renderTicketTypeTabs = (venueId) => {
    const venueTicketTypes = selectedTicketTypes[venueId] || [];
    if (venueTicketTypes.length === 0) {
      return (
        <Card size="small">
          <Text type="secondary">Please select ticket types first</Text>
        </Card>
      );
    }

    const currentVenueData = venueData[venueId];
    const venueTicketTypesData =
      currentVenueData?.tickets.filter((ticket) =>
        venueTicketTypes.includes(ticket.id)
      ) || [];

    if (venueTicketTypesData.length === 0) {
      return (
        <Card size="small">
          <Text type="secondary">Loading ticket type data...</Text>
        </Card>
      );
    }

    const handleTabChange = (activeKey) => {
      setActiveTicketTypeTab((prev) => ({
        ...prev,
        [venueId]: activeKey,
      }));
    };

    const currentActiveTab =
      activeTicketTypeTab[venueId] || venueTicketTypesData[0]?.id?.toString();

    return (
      <Tabs type="card" activeKey={currentActiveTab} onChange={handleTabChange}>
        {venueTicketTypesData.map((ticketType) => (
          <TabPane tab={ticketType.name} key={ticketType.id.toString()}>
            {renderTicketSetSelection(venueId, ticketType.id, ticketType.name)}
          </TabPane>
        ))}
      </Tabs>
    );
  };

  const renderTicketTypeSelection = (venueId) => {
    const currentVenueData = venueData[venueId];
    const venueTicketTypes = currentVenueData?.tickets || [];

    if (
      ticketLoading &&
      (!currentVenueData || !currentVenueData.tickets?.length)
    ) {
      return (
        <Card
          title="Ticket Type Selection"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Spin />
        </Card>
      );
    }

    if (venueTicketTypes.length === 0) {
      return (
        <Card
          title="Ticket Type Selection"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Text type="secondary">
            No ticket types available for this venue.
          </Text>
        </Card>
      );
    }

    return (
      <Card
        title="Ticket Type Selection"
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name={["selected_ticket_types", venueId]}
          style={{ marginBottom: 0 }}
        >
          <Select
            mode="multiple"
            placeholder="Select ticket types"
            style={{ width: "100%" }}
            onChange={(value) => {
              const currentValue = selectedTicketTypes[venueId] || [];

              if (value.length < currentValue.length) {
                const removed = currentValue.find(
                  (item) => !value.includes(item)
                );

                if (removed && !handleTicketTypeDeselect(venueId, removed)) {
                  form.setFieldValue(
                    ["selected_ticket_types", venueId],
                    currentValue
                  );
                  return;
                }
              }

              handleTicketTypeSelection(venueId, value);
            }}
            onDeselect={(deselectedValue) => {
              if (!handleTicketTypeDeselect(venueId, deselectedValue)) {
                return;
              }
            }}
            value={selectedTicketTypes[venueId] || []}
          >
            {venueTicketTypes.map((ticketType) => {
              const isSubmitted = isSubmittedTicketType(venueId, ticketType.id);
              const isSelected =
                selectedTicketTypes[venueId]?.includes(ticketType.id) || false;

              return (
                <Option
                  key={ticketType.id}
                  value={ticketType.id}
                  disabled={isSubmitted && isSelected}
                >
                  <Space>
                    <Text>{ticketType.name}</Text>
                    <Text type="secondary">{ticketType.description}</Text>
                    {isSubmitted && isSelected && (
                      <Text type="warning">(Submitted)</Text>
                    )}
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Card>
    );
  };

  const handleTicketTypeDeselect = (venueId, deselectedValue) => {
    if (isSubmittedTicketType(venueId, deselectedValue)) {
      message.error(
        "This ticket type is already submitted and cannot be removed"
      );
      return false;
    }
    return true;
  };

  const renderVenueTab = (venue) => {
    return (
      <div>
        {renderSeatSelection(venue.id)}
        {renderTicketTypeSelection(venue.id)}

        <Card title="Ticket Sets" size="small">
          {renderTicketTypeTabs(venue.id)}
        </Card>
      </div>
    );
  };

  const selectedVenues = Array.isArray(filteredVenues)
    ? filteredVenues.filter((v) => venues.includes(v.id))
    : [];

  if (!venues || venues.length === 0) {
    return (
      <Card title="Ticket Selection" bordered>
        <Text type="secondary">
          No venues selected. Please select venues first.
        </Text>
      </Card>
    );
  }

  return (
    <Form form={form} layout="vertical">
      <Card title="Ticket Selection" bordered>
        <Tabs
          type="card"
          size="large"
          activeKey={activeVenueTab}
          onChange={handleVenueTabChange}
        >
          {selectedVenues.map((venue) => (
            <TabPane tab={venue.name} key={venue.id.toString()}>
              {renderVenueTab(venue)}
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Form.Item name="selected_seats" hidden />
      <Form.Item name="selected_ticket_types" hidden />
      <Form.Item name="ticket_sets" hidden />
      <Form.Item name="ticket_quantities" hidden />
    </Form>
  );
};

export default TicketSelectionField;
