import React, { useCallback, useEffect, useState } from "react";
import { Card, Form, Select, Input, Row, Col, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  resetSchedule,
  setScheduleSelectTime,
} from "store/slices/scheduleSlice";
import { setSelectedVenue } from "store/slices/locationSlice";
import { EVENT_TYPES } from "constants/PageConstants";
import { debounce } from "lodash";

const { Option } = Select;

export function ScheduleDetails({ form }) {
  const dispatch = useDispatch();
  const {
    filteredEvents = [],
    loading,
    selectedEvent,
  } = useSelector((state) => state.event);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await dispatch(
          fetchAllEvent({ event_type: EVENT_TYPES.event })
        ).unwrap();
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

  return (
    <Card title="Schedule Details">
      <Row gutter={24}>
        <Col sm={12} xl={24}>
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

        <Col sm={12} xl={24}>
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

        {selectedEvent?.venues?.length > 0 && (
          <Col sm={24} xl={24}>
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
        )}
        <Col sm={12} xl={24}>
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
        <Col sm={12} xl={24}>
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
      </Row>
    </Card>
  );
}
