import React, { useEffect, useState, useCallback } from "react";
import * as antd from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTickets } from "store/slices/ticketSlice";
import { getEventAllSeatStructures } from "store/slices/movieSeatSlice";
import { setEventFormData } from "store/slices/eventSlice";

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

const TicketSelectionField = ({ form, currentValues }) => {
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

  const { filteredTickets, loading: ticketLoading } = useSelector(
    (state) => state.tickets
  );
  const { allSeats, loading: seatsLoading } = useSelector(
    (state) => state.movieSeatSlice
  );
  const { filteredVenues } = useSelector((state) => state.locations);

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
          renderItem={(seat) => (
            <List.Item>
              <Checkbox
                checked={selectedSeats[venueId]?.[seat.id] || false}
                // disabled={!seat.available}
                onChange={(e) =>
                  handleSeatSelection(venueId, seat.id, e.target.checked)
                }
              >
                <Space>
                  <Text strong>{seat.name}</Text>
                  <Text>Total Seats: {seat.total_seats}</Text>
                  {seat.seat_data?.seatTypes &&
                    Array.isArray(seat.seat_data.seatTypes) &&
                    seat.seat_data.seatTypes.map((type) => (
                      <Text key={type.value} type="secondary">
                        {type.label}
                      </Text>
                    ))}
                  {/* {!seat.available && <Text type="danger">(Unavailable)</Text>} */}
                </Space>
              </Checkbox>
            </List.Item>
          )}
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
            onChange={(value) =>
              handleTicketSetSelection(venueId, ticketTypeId, value)
            }
            value={ticketSets[venueId]?.[ticketTypeId] || []}
          >
            {ticketSetsForType.map((setData, index) => (
              <Option
                key={`${setData.ticket_set}-${index}`}
                value={setData.ticket_set}
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
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    );
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
              const currentTypes =
                form.getFieldValue("selected_ticket_types") || {};
              const updatedTypes = {
                ...currentTypes,
                [venueId]: value,
              };
              form.setFieldValue("selected_ticket_types", updatedTypes);
            }}
            value={selectedTicketTypes[venueId] || []}
          >
            {venueTicketTypes.map((ticketType) => (
              <Option key={ticketType.id} value={ticketType.id}>
                <Space>
                  <Text>{ticketType.name}</Text>
                  <Text type="secondary">
                    {ticketType.description || "General Admission"}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    );
  };

  const renderVenueTab = (venue) => {
    const hasSeats =
      selectedSeats[venue.id] &&
      Object.values(selectedSeats[venue.id]).some(
        (selected) => selected === true
      );
    const hasTicketTypes =
      selectedTicketTypes[venue.id] && selectedTicketTypes[venue.id].length > 0;
    const hasTicketSets =
      hasTicketTypes &&
      selectedTicketTypes[venue.id].some((typeId) => {
        const sets = ticketSets[venue.id]?.[typeId];
        return Array.isArray(sets) && sets.length > 0;
      });

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
