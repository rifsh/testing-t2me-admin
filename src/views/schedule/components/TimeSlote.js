import React from 'react';
import { Form, TimePicker, Select, Button, Row, Col, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const TimeSlots = ({ 
  dateStr, 
  timeSlots, 
  form, 
  eventStartTime,
  ticketOptions,
  getEventTimezone,
  onAddSlot,
  onRemoveSlot,
  onApplyToAll
}) => {
  const handleTimeChange = (dateStr, index, type, value) => {
    // Convert the selected time to the event timezone if it's a time value
    const timeValue = (type === 'start' || type === 'end') && value 
      ? value.tz(getEventTimezone()) 
      : value;

    // Get all current time slots
    const currentSlots = form.getFieldValue(['timeSlots', dateStr]) || [];
    
    // Update the specific slot
    const updatedSlots = currentSlots.map((slot, i) => 
      i === index ? { ...slot, [type]: timeValue } : slot
    );

    // Update form
    form.setFieldsValue({
      timeSlots: {
        ...form.getFieldValue('timeSlots'),
        [dateStr]: updatedSlots
      }
    });

    // Only validate times if the change is for start or end time
    if (type === 'start' || type === 'end') {
      validateTimeSequence(dateStr, index, type, timeValue, updatedSlots);
    }
  };

  const validateTimeSequence = (dateStr, index, type, value, slots) => {
    if (!value) return;

    const currentSlot = slots[index];
    const previousSlot = index > 0 ? slots[index - 1] : null;
    const nextSlot = index < slots.length - 1 ? slots[index + 1] : null;

    // Validation rules
    if (type === 'start') {
      // Check against event start time
      if (eventStartTime && value.isBefore(eventStartTime)) {
        form.setFields([{
          name: ['timeSlots', dateStr, index, 'start'],
          errors: ['Start time must be after event start time']
        }]);
        return;
      }

      // Check against previous slot's end time
      if (previousSlot?.end && value.isBefore(previousSlot.end)) {
        form.setFields([{
          name: ['timeSlots', dateStr, index, 'start'],
          errors: ['Start time must be after previous slot end time']
        }]);
        return;
      }

      // Check against current slot's end time
      if (currentSlot.end && value.isAfter(currentSlot.end)) {
        form.setFields([{
          name: ['timeSlots', dateStr, index, 'start'],
          errors: ['Start time must be before end time']
        }]);
      }
    } else if (type === 'end') {
      // Check against current slot's start time
      if (currentSlot.start && value.isBefore(currentSlot.start)) {
        form.setFields([{
          name: ['timeSlots', dateStr, index, 'end'],
          errors: ['End time must be after start time']
        }]);
        return;
      }

      // Check against next slot's start time
      if (nextSlot?.start && value.isAfter(nextSlot.start)) {
        form.setFields([{
          name: ['timeSlots', dateStr, index, 'end'],
          errors: ['End time must be before next slot start time']
        }]);
      }
    }
  };

  const getDisabledTimes = (index, type) => {
    const slots = form.getFieldValue(['timeSlots', dateStr]) || [];
    const currentSlot = slots[index];
    const previousSlot = index > 0 ? slots[index - 1] : null;
    const nextSlot = index < slots.length - 1 ? slots[index + 1] : null;

    return {
      disabledHours: () => {
        const hours = [];
        
        if (eventStartTime) {
          for (let i = 0; i < eventStartTime.hour(); i++) {
            hours.push(i);
          }
        }

        if (type === 'start' && previousSlot?.end) {
          for (let i = 0; i < previousSlot.end.hour(); i++) {
            hours.push(i);
          }
        }

        if (type === 'end') {
          if (currentSlot?.start) {
            for (let i = 0; i < currentSlot.start.hour(); i++) {
              hours.push(i);
            }
          }
          if (nextSlot?.start) {
            for (let i = nextSlot.start.hour(); i < 24; i++) {
              hours.push(i);
            }
          }
        }

        return hours;
      },
      disabledMinutes: (hour) => {
        const minutes = [];

        if (type === 'start') {
          if (previousSlot?.end && previousSlot.end.hour() === hour) {
            for (let i = 0; i <= previousSlot.end.minute(); i++) {
              minutes.push(i);
            }
          }
        } else if (type === 'end') {
          if (currentSlot?.start && currentSlot.start.hour() === hour) {
            for (let i = 0; i < currentSlot.start.minute(); i++) {
              minutes.push(i);
            }
          }
          if (nextSlot?.start && nextSlot.start.hour() === hour) {
            for (let i = nextSlot.start.minute(); i < 60; i++) {
              minutes.push(i);
            }
          }
        }

        return minutes;
      }
    };
  };

  return (
    <div style={{ marginTop: 16 }}>
      {timeSlots[dateStr]?.map((slot, index) => (
        <Row
          key={index}
          gutter={[16, 16]}
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col span={6}>
            <Form.Item
              name={["timeSlots", dateStr, index, "start"]}
              label="Start Time"
              rules={[
                { required: true, message: "Please select start time" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    const slots = form.getFieldValue(['timeSlots', dateStr]);
                    validateTimeSequence(dateStr, index, 'start', value, slots);
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.start}
                onChange={(time) => handleTimeChange(dateStr, index, "start", time)}
                style={{ width: "100%" }}
                placeholder="Start Time"
                {...getDisabledTimes(index, 'start')}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name={["timeSlots", dateStr, index, "end"]}
              label="End Time"
              rules={[
                { required: true, message: "Please select end time" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    const slots = form.getFieldValue(['timeSlots', dateStr]);
                    validateTimeSequence(dateStr, index, 'end', value, slots);
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.end}
                onChange={(time) => handleTimeChange(dateStr, index, "end", time)}
                style={{ width: "100%" }}
                placeholder="End Time"
                {...getDisabledTimes(index, 'end')}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Ticket Type"
              name={["timeSlots", dateStr, index, "ticketType"]}
              rules={[
                { required: true, message: "Please select a ticket type" }
              ]}
            >
              <Select
                options={ticketOptions}
                value={slot.ticketType}
                onChange={(value) => handleTimeChange(dateStr, index, "ticketType", value)}
                style={{ width: "100%" }}
                placeholder="Select Ticket Type"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Space>
              <Button
                type="default"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => onRemoveSlot(dateStr, index)}
              />
              <Button
                type="default"
                icon={<CopyOutlined />}
                onClick={() => onApplyToAll(dateStr, index)}
                title="Apply this slot to all dates"
              />
            </Space>
          </Col>
        </Row>
      ))}

      <Button
        type="dashed"
        onClick={() => onAddSlot(dateStr)}
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 16 }}
      >
        Add Time Slot
      </Button>
    </div>
  );
};

export default TimeSlots;