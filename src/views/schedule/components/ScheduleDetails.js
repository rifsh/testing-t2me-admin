import React, { useEffect } from "react";
import { Card, Form, Select, Input, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent, setSelectedEvent } from "store/slices/eventSlice";
import {
  resetSchedule,
  setScheduleSelectTime,
} from "store/slices/scheduleSlice";
import { setSelectedVenue } from "store/slices/locationSlice";

const { Option } = Select;

export function ScheduleDetails({ form }) {
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent({}));
  }, [dispatch]);
  const handleSelectEvent = (id) => {
    if (!id) return;

    dispatch(setScheduleSelectTime(false));
    dispatch(setSelectedEvent(id));

    const selectedEvent = filteredEvents.find((event) => event.id === id);

    if (selectedEvent && selectedEvent.venue) {
      dispatch(setSelectedVenue(selectedEvent.venue.id));
    }
    const currentValues = form.getFieldsValue();
    const valuesToKeep = {
      event_id: id,
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
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filteredEvents.map((event) => (
            <Option key={event.id} value={event.id}>
              {event.event_name}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Card>
  );
}
