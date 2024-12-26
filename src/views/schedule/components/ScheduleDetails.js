import React, { useEffect } from "react";
import { Card, Form, Select, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvent } from "store/slices/eventSlice";
import { resetSchedule } from "store/slices/scheduleSlice";

const { Option } = Select;

export function ScheduleDetails() {
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent({}));
  }, [dispatch]);
  const handleSelectEvent = () => {
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
