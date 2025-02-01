import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Form,
  DatePicker,
  TimePicker,
  Button,
  Typography,
  Row,
  Col,
  Tabs,
  Space,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

const { Title } = Typography;

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export function ScheduleTimeSlots() {
  const [form] = Form.useForm();
  const [timeSlots, setTimeSlots] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [dates, setDates] = useState([]);

  const timeZone = dayjs.tz.guess();
  const currentDateInTimeZone = useMemo(() => dayjs().tz(timeZone), [timeZone]);

  // Generate dates when start and end dates change
  const updateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    
    const newDates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isSameOrBefore(end, 'day')) {
      newDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    setDates(newDates);
    setActiveTab(newDates[0]);
    const initialTimeSlots = {};
    newDates.forEach(date => {
      initialTimeSlots[date] = [{ start: null, end: null }];
    });
    setTimeSlots(initialTimeSlots);
  };

  const addTimeSlot = (dateStr) => {
    setTimeSlots(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), { start: null, end: null }],
    }));
  };

  const removeTimeSlot = (dateStr, index) => {
    setTimeSlots(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (dateStr, index, type, time) => {
    setTimeSlots(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].map((slot, i) =>
        i === index ? { ...slot, [type]: time } : slot
      ),
    }));
  };

  const validateTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return { valid: true };

    const sortedSlots = [...slots].sort(
      (a, b) => a.start?.valueOf() - b.start?.valueOf()
    );

    for (let i = 0; i < sortedSlots.length; i++) {
      const { start, end } = sortedSlots[i];

      if (!start || !end) {
        return {
          valid: false,
          message: "All time slots must have start and end times",
        };
      }

      if (end.isSameOrBefore(start)) {
        return { valid: false, message: "End time must be after start time" };
      }

      if (i < sortedSlots.length - 1) {
        const nextSlot = sortedSlots[i + 1];
        if (end.isAfter(nextSlot.start)) {
          return { valid: false, message: "Time slots cannot overlap" };
        }
      }
    }

    return { valid: true };
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const eventStart = values.start_date;
      const eventEnd = values.end_date;

      let isValid = true;
      let errorMessage = "";

      Object.entries(timeSlots).forEach(([date, slots]) => {
        const validation = validateTimeSlots(slots);
        if (!validation.valid) {
          isValid = false;
          errorMessage = `${dayjs(date).format("MMM D, YYYY")}: ${validation.message}`;
        }

        slots.forEach((slot) => {
          if (!slot.start || !slot.end) return;
          const slotStart = dayjs(date).hour(slot.start.hour()).minute(slot.start.minute());
          const slotEnd = dayjs(date).hour(slot.end.hour()).minute(slot.end.minute());

          if (slotStart.isBefore(eventStart) || slotEnd.isAfter(eventEnd)) {
            isValid = false;
            errorMessage = `Time slots must be within event start and end times`;
          }
        });
      });

      if (!isValid) {
        message.error(errorMessage);
        return;
      }

      const formattedData = {
        event_times: {
          start_date: values.start_date.format(),
          end_date: values.end_date.format(),
          adv_start_time: values.adv_start_time?.format(),
          booking_start_time: values.booking_start_time.format(),
        },
        time_slots: Object.entries(timeSlots).map(([date, slots]) => ({
          date,
          slots: slots.map((slot) => ({
            start_time: slot.start?.format("HH:mm"),
            end_time: slot.end?.format("HH:mm"),
          })),
        })),
      };

      console.log("Submission data:", formattedData);
      message.success("Schedule saved successfully");
    });
  };

  const handleReset = () => {
    form.resetFields();
    setTimeSlots({});
    setDates([]);
    setActiveTab(null);
  };

  return (
    <Form form={form} layout="vertical">
      
        <Title level={4}>Schedule Time Slots</Title>
        
        <Card>
          <Title level={5}>Event Time</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="start_date"
                label="Event Start Time"
                rules={[
                  { required: true, message: "Please select start time" },
                  {
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value.isBefore(currentDateInTimeZone, "minute")) {
                        return Promise.reject(new Error("Start time cannot be in the past"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Select start time"
                  onChange={(date) => {
                    const endDate = form.getFieldValue("end_date");
                    if (date && endDate) {
                      updateDateRange(date, endDate);
                    }
                  }}
                  disabledDate={(current) =>
                    current && current.isBefore(currentDateInTimeZone, "day")
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="end_date"
                label="Event End Time"
                rules={[
                  { required: true, message: "Please select end time" },
                  {
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const startDate = form.getFieldValue("start_date");
                      if (!startDate) {
                        return Promise.reject(new Error("Please select start time first"));
                      }
                      if (value.isSameOrBefore(startDate)) {
                        return Promise.reject(new Error("End time must be after start time"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Select end time"
                  onChange={(date) => {
                    const startDate = form.getFieldValue("start_date");
                    if (startDate && date) {
                      updateDateRange(startDate, date);
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="adv_start_time"
                label="Advanced Start Time"
                rules={[
                  {
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const startDate = form.getFieldValue("start_date");
                      if (value.isAfter(startDate)) {
                        return Promise.reject(new Error("Advanced start must be before event start"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Select advanced start time"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="booking_start_time"
                label="Booking Start Time"
                rules={[
                  { required: true, message: "Please select booking start time" },
                  {
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const startDate = form.getFieldValue("start_date");
                      if (startDate && value.isAfter(startDate)) {
                        return Promise.reject(new Error("Booking start must be before event start"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Select booking start time"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {dates.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Time Slots</Title>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              style={{ marginTop: 16 }}
            >
              {dates.map((dateStr) => (
                <Tabs.TabPane
                  tab={dayjs(dateStr).format("MMM D, YYYY")}
                  key={dateStr}
                  closeIcon
                >
                  {timeSlots[dateStr]?.map((slot, index) => (
                    <Row
                      key={index}
                      gutter={[16, 16]}
                      align="middle"
                      style={{ marginBottom: 16 }}
                    >
                      <Col span={8}>
                        <TimePicker
                          format="HH:mm"
                          value={slot.start}
                          onChange={(time) =>
                            handleTimeChange(dateStr, index, "start", time)
                          }
                          style={{ width: "100%" }}
                          placeholder="Start Time"
                        />
                      </Col>
                      <Col span={8}>
                        <TimePicker
                          format="HH:mm"
                          value={slot.end}
                          onChange={(time) =>
                            handleTimeChange(dateStr, index, "end", time)
                          }
                          style={{ width: "100%" }}
                          placeholder="End Time"
                        />
                      </Col>
                      <Col span={8}>
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => removeTimeSlot(dateStr, index)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => addTimeSlot(dateStr)}
                    icon={<PlusOutlined />}
                    block
                    style={{ marginTop: 16 }}
                  >
                    Add Time Slot
                  </Button>
                </Tabs.TabPane>
              ))}
            </Tabs>
          </Card>
        )}

     
    </Form>
  );
}