import React, { useEffect, useState } from "react";
import { Card, Form, Select, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  resetSchedule,
  setScheduleSelectTime,
} from "store/slices/scheduleSlice";
import { setSelectedVenue } from "store/slices/locationSlice";
import { EVENT_TYPES } from "constants/PageConstants";

const { Option } = Select;

export function ScheduleDetails({ form, type }) {
  const dispatch = useDispatch();
  const {
    filteredEvents = [],
    loading,
    selectedEvent,
  } = useSelector((state) => state.event);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event })).unwrap();
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

  return (
    <Card title="Schedule Details">
      <Form.Item
        name="name"
        label="Schedule Name"
        rules={[{ required: true, message: "Please provide a schedule name" }]}
      >
        <Input placeholder="Enter schedule name" />
      </Form.Item>

      {type === "event" && <Form.Item
        name="event_id"
        label="Event"
        rules={[{ required: true, message: "Please select an event" }]}
      >
        <Select
          loading={loading}
          className="w-100"
          placeholder="Select an event"
          onChange={handleSelectEvent}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option?.label?.toLowerCase()?.includes(input.toLowerCase())
          }
        >
          {filteredEvents.map((event) => (
            <Option key={event.id} value={event.id} label={event.event_name}>
              {event.event_name}
            </Option>
          ))}
        </Select>
      </Form.Item>}

      {type === 'movie' && <Form.Item
        name="movie"
        label="Movie"
        rules={[{ required: true, message: "Please select an event" }]}
      >
        <Select
          loading={loading}
          className="w-100"
          placeholder="Select an event"
          onChange={handleSelectEvent}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option?.label?.toLowerCase()?.includes(input.toLowerCase())
          }
        >
          {filteredEvents.map((event) => (
            <Option key={event.id} value={event.id} label={event.event_name}>
              {event.event_name}
            </Option>
          ))}
        </Select>
      </Form.Item>}

      {selectedEvent?.venues?.length > 0 && (
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
      )}
    </Card>
  );
}
