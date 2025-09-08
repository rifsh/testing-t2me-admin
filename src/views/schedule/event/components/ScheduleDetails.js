import React, { useCallback, useEffect, useState } from "react";
import { Card, Form, Select, Input, Row, Col, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  resetSchedule,
  setAddOnServie,
  setScheduleSelectTime,
} from "store/slices/scheduleSlice";
import { setSelectedVenue } from "store/slices/locationSlice";
import { EVENT_TYPES } from "constants/PageConstants";
import { debounce } from "lodash";
import {
  getAvailableTicketsType,
  setSelectedTicketType,
} from "store/slices/ticketSlice";
import { getPaymentAddOnService } from "store/slices/paymentSlice";

const { Option } = Select;

export function ScheduleDetails({ form }) {
  const dispatch = useDispatch();
  const {
    filteredEvents = [],
    loading,
    selectedEvent,
  } = useSelector((state) => state.event);
  const { availableTicketTyps, selectedTicketType } = useSelector(
    (state) => state.tickets
  );
  const { addOnServiceList } = useSelector((state) => state.payment);
  const [showBookingLimit, setShowBookingLimit] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await dispatch(
          fetchAllEvent({ event_type: EVENT_TYPES.event })
        ).unwrap();
        dispatch(getPaymentAddOnService());
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, [dispatch]);

  const handleSelectEvent = (id) => {
    if (!id) {
      dispatch(setSelectedEvent(null));
      form.resetFields(["event_id", "venue_id"]);
      dispatch(resetSchedule());
      return;
    }
    dispatch(getAvailableTicketsType({ event_id: id }));

    const event = filteredEvents.find((event) => event.id === id);
    if (!event) return;

    dispatch(setScheduleSelectTime(false));
    dispatch(setSelectedEvent(event));

    const venueId = event.venues?.[0]?.id || null;
    dispatch(setSelectedVenue(venueId));
    form.setFieldsValue({ event_id: id, venue_id: venueId });

    const currentValues = form.getFieldsValue();
    const valuesToKeep = {
      event_id: id,
      venue_id: venueId,
      name: currentValues.name,
      add_ons: currentValues.add_ons, // Preserve add_ons
    };
    form.resetFields();
    form.setFieldsValue(valuesToKeep);

    dispatch(resetSchedule());
  };

  const handleSelectVenue = (id) => {
    if (!id) {
      return;
    }
    dispatch(setSelectedVenue(id));
    const currentValues = form.getFieldsValue();
    const valuesToKeep = {
      event_id: currentValues.event_id,
      venue_id: id,
      name: currentValues.name,
      add_ons: currentValues.add_ons, // Preserve add_ons
    };
    form.resetFields();
    form.setFieldsValue(valuesToKeep);

    dispatch(resetSchedule());
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event, search: value }));
    }, 500),
    [dispatch]
  );

  const handleSearch = (value) => {
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
    }
  };

  const handleBookingLimitToggle = (e) => {
    const value = e.target.value;
    setShowBookingLimit(value);

    if (!value) {
      form.setFieldsValue({ booking_limit_per_user: undefined });
    }
  };

  const handleAddOnsChange = (selectedValues) => {
    const addOnsData = (addOnServiceList?.available_add_ons || [])
      .filter((addon) => selectedValues.includes(addon.name)) 
      .map((addon) => ({
        name: addon.name,
        status: true,
        id: addon.id, 
        price: addon.price,
      }));  

    dispatch(setAddOnServie(addOnsData));
    form.setFieldsValue({ add_ons: selectedValues });
  };

  return (
    <Card title="Schedule Details">
      <Row gutter={24}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={[
              { required: true, message: "Please provide a schedule name" },
            ]}
          >
            <Input placeholder="Enter schedule name" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="event_id"
            label="Event"
            rules={[{ required: true, message: "Please select an event" }]}
          >
            <Select
              loading={loading}
              className="w-100"
              placeholder="Select an event"
              onChange={handleSelectEvent}
              onSearch={handleSearch}
              allowClear
              showArrow
              showSearch
              filterOption={(input, option) =>
                option?.label?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {filteredEvents.map((event) => (
                <Option
                  key={event.id}
                  value={event.id}
                  label={event.event_name}
                >
                  {event.event_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Row 2: Venue & Booking Type */}
        {selectedEvent?.venues?.length > 0 && (
          <>
            <Col xs={24} sm={12}>
              <Form.Item
                name="venue_id"
                label="Venue"
                rules={[{ required: true, message: "Please select a venue" }]}
              >
                <Select
                  loading={loading}
                  className="w-100"
                  placeholder="Select a venue"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase()?.includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    handleSelectVenue(value);
                  }}
                >
                  {selectedEvent?.venues?.map((venue) => (
                    <Option key={venue.id} value={venue.id} label={venue.name}>
                      {venue.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="available_types"
                label="Booking Type"
                rules={[
                  { required: true, message: "Please select a booking type" },
                ]}
              >
                <Select
                  loading={loading}
                  className="w-100"
                  placeholder="Select a booking type"
                  allowClear
                  showSearch
                  onChange={(value) => {
                    dispatch(setSelectedTicketType(value));
                  }}
                >
                  {availableTicketTyps?.available_types?.map((type) => (
                    <Option key={type.id} value={type.id} label={type.name}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </>
        )}

        {/* Row 3: Max Tickets & Multi Date */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="max_ticket_per_booking"
            label="Max Tickets Per Booking"
            rules={[
              {
                required: true,
                message: "Please specify maximum tickets per booking",
              },
            ]}
          >
            <Input
              placeholder="Enter maximum tickets per booking"
              type="number"
              min={1}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="is_multi_date"
            label="Allow Multiple Dates Booking"
            rules={[
              {
                required: true,
                message: "Please specify if multiple dates are allowed",
              },
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        {/* Row 4: Booking Limit Toggle */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="booking_limit_per_user_toggle"
            label="Limit Bookings Per User"
            rules={[
              {
                required: true,
                message: "Please specify if booking limit is required",
              },
            ]}
          >
            <Radio.Group onChange={handleBookingLimitToggle}>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        {showBookingLimit && (
          <Col xs={24} sm={12}>
            <Form.Item
              name="booking_limit_per_user"
              label="Booking Limit Per User"
              rules={[
                {
                  required: true,
                  message: "Please specify booking limit per user",
                },
              ]}
            >
              <Input
                placeholder="Enter booking limit per user"
                type="number"
                min={1}
              />
            </Form.Item>
          </Col>
        )}

        {/* Row 5: Payment Required & Add-Ons */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="payment_required"
            label="Is Payment Required"
            rules={[
              {
                required: true,
                message: "Please specify if payment is required",
              },
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name="add_ons" label="Add-On Services">
            <Select
              loading={loading}
              className="w-100"
              placeholder="Select Add-On Services"
              allowClear
              showArrow
              showSearch
              mode="multiple"
              onChange={handleAddOnsChange}
              filterOption={(input, option) =>
                option?.label?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {addOnServiceList?.available_add_ons?.map((addon) => (
                <Option key={addon.name} value={addon.name} label={addon.name}>
                  {addon.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
