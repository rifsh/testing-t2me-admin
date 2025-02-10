import React, { useEffect } from "react";
import {
  Form,
  TimePicker,
  Select,
  Button,
  Row,
  Col,
  Space,
  message,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { updateTimeSlot } from "store/slices/scheduleSlice";
import { useDispatch } from "react-redux";

const TimeSlots = ({
  dateStr,
  timeSlots,
  form,
  eventStartTime,
  bookingStartTime,
  ticketOptions,
  setTimeSlots,
  getEventTimezone,
  onAddSlot,
  onRemoveSlot,
  onApplyToAll,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const slots = form.getFieldValue(["timeSlots", dateStr]) || [];
    if (slots.length > 0) {
      validateAllSlots(dateStr, slots);
    }
  }, [bookingStartTime, eventStartTime, dateStr]);

  const validateTimeSlot = (dateStr, index, currentSlot, slots) => {
    const previousSlot = index > 0 ? slots[index - 1] : null;
    const nextSlot = index < slots.length - 1 ? slots[index + 1] : null;
    const isFirstDayFirstShow =
      dateStr === eventStartTime?.format("YYYY-MM-DD") && index === 0;

    // Start time validations
    if (currentSlot.start_time) {
      if (isFirstDayFirstShow && bookingStartTime) {
        const startDateTime = currentSlot.start_time.format("YYYY-MM-DD HH:mm");
        const bookingDateTime = bookingStartTime.format("YYYY-MM-DD HH:mm");
        if (currentSlot.start_time.isBefore(bookingStartTime)) {
          return {
            valid: false,
            field: "start_time",
            message: "First show must start after booking start time",
          };
        }
      }

      if (
        previousSlot?.end_time &&
        currentSlot.start_time.isSameOrBefore(previousSlot.end_time)
      ) {
        return {
          valid: false,
          field: "start_time",
          message: "Start time must be after previous slot end time",
        };
      }
    }

    // End time validations
    if (currentSlot.end_time) {
      if (currentSlot.end_time.isSameOrBefore(currentSlot.start_time)) {
        return {
          valid: false,
          field: "end_time",
          message: "End time must be after start time",
        };
      }

      if (
        nextSlot?.start_time &&
        currentSlot.end_time.isAfter(nextSlot.start_time)
      ) {
        return {
          valid: false,
          field: "end_time",
          message: "End time must be before next slot start time",
        };
      }
    }

    return { valid: true };
  };

  const clearFormFields = (dateStr, index, fields) => {
    const clearValues = {};
    fields.forEach((field) => {
      clearValues[field] = null;
    });

    form.setFields([
      {
        name: ["timeSlots", dateStr, index],
        value: clearValues,
        errors: [],
      },
    ]);
  };

  const validateAllSlots = (dateStr, slots) => {
    let hasError = false;
    const updatedSlots = [...slots];

    for (let i = 0; i < slots.length; i++) {
      const validationResult = validateTimeSlot(dateStr, i, slots[i], slots);
      if (!validationResult.valid) {
        hasError = true;
        message.warning(validationResult.message);

        // Clear affected slots
        for (let j = i; j < slots.length; j++) {
          if (j === i) {
            if (validationResult.field === "end_time") {
              updatedSlots[j] = {
                ...updatedSlots[j],
                end_time: null,
                ticketType: null,
              };
            } else {
              updatedSlots[j] = {
                start_time: null,
                end_time: null,
                ticketType: null,
              };
            }
          } else {
            updatedSlots[j] = {
              start_time: null,
              end_time: null,
              ticketType: null,
            };
          }
          clearFormFields(dateStr, j, ["start_time", "end_time", "ticketType"]);
        }
        break;
      }
    }

    if (hasError) {
      dispatch(
        setTimeSlots({
          ...timeSlots,
          [dateStr]: updatedSlots,
        })
      );
    }

    return !hasError;
  };

  const handleTimeChange = (dateStr, index, type, value) => {
    const timeValue = value
      ? type === "ticketType"
        ? value
        : value.tz(getEventTimezone())
      : null;

    const currentSlots = form.getFieldValue(["timeSlots", dateStr]) || [];
    const updatedSlots = [...currentSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [type]: timeValue,
    };

    dispatch(
      updateTimeSlot({
        dateStr,
        index,
        field: type,
        value: timeValue,
      })
    );

    validateAllSlots(dateStr, updatedSlots);
  };

  const getDisabledTimes = (index, type) => {
    const slots = form.getFieldValue(["timeSlots", dateStr]) || [];
    const currentSlot = slots[index];
    const previousSlot = index > 0 ? slots[index - 1] : null;
    const nextSlot = index < slots.length - 1 ? slots[index + 1] : null;
    const isFirstDayFirstShow =
      dateStr === eventStartTime?.format("YYYY-MM-DD") && index === 0;

    return {
      disabledHours: () => {
        const hours = new Set();

        if (
          isFirstDayFirstShow &&
          type === "start_time" &&
          bookingStartTime?.format("YYYY-MM-DD") ===
            eventStartTime?.format("YYYY-MM-DD")
        ) {
          for (let i = 0; i < bookingStartTime.hour(); i++) {
            hours.add(i);
          }
        }

        if (
          !isFirstDayFirstShow &&
          type === "start_time" &&
          previousSlot?.end_time
        ) {
          for (let i = 0; i < previousSlot.end_time.hour(); i++) {
            hours.add(i);
          }
        }

        if (type === "end_time" && currentSlot?.start_time) {
          for (let i = 0; i < currentSlot.start_time.hour(); i++) {
            hours.add(i);
          }
        }

        if (type === "end_time" && nextSlot?.start_time) {
          for (let i = nextSlot.start_time.hour(); i < 24; i++) {
            hours.add(i);
          }
        }

        return Array.from(hours);
      },
      disabledMinutes: (hour) => {
        const minutes = new Set();

        if (
          isFirstDayFirstShow &&
          type === "start_time" &&
          bookingStartTime?.format("YYYY-MM-DD") ===
            eventStartTime?.format("YYYY-MM-DD") &&
          hour === bookingStartTime.hour()
        ) {
          for (let i = 0; i < bookingStartTime.minute(); i++) {
            minutes.add(i);
          }
        }

        if (
          !isFirstDayFirstShow &&
          type === "start_time" &&
          previousSlot?.end_time &&
          hour === previousSlot.end_time.hour()
        ) {
          for (let i = 0; i <= previousSlot.end_time.minute(); i++) {
            minutes.add(i);
          }
        }

        if (
          type === "end_time" &&
          currentSlot?.start_time &&
          hour === currentSlot.start_time.hour()
        ) {
          for (let i = 0; i < currentSlot.start_time.minute(); i++) {
            minutes.add(i);
          }
        }

        if (
          type === "end_time" &&
          nextSlot?.start_time &&
          hour === nextSlot.start_time.hour()
        ) {
          for (let i = nextSlot.start_time.minute(); i < 60; i++) {
            minutes.add(i);
          }
        }

        return Array.from(minutes);
      },
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
              name={["timeSlots", dateStr, index, "start_time"]}
              label="Start Time"
              rules={[{ required: true, message: "Please select start time" }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <TimePicker
                format="HH:mm"
                value={timeSlots[dateStr]?.[index]?.start_time}
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "start_time", time)
                }
                style={{ width: "100%" }}
                placeholder="Start Time"
                {...getDisabledTimes(index, "start_time")}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name={["timeSlots", dateStr, index, "end_time"]}
              label="End Time"
              rules={[{ required: true, message: "Please select end time" }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <TimePicker
                format="HH:mm"
                value={timeSlots[dateStr]?.[index]?.end_time}
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "end_time", time)
                }
                style={{ width: "100%" }}
                placeholder="End Time"
                {...getDisabledTimes(index, "end_time")}
                disabled={!timeSlots[dateStr]?.[index]?.start_time}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Ticket Type"
              name={["timeSlots", dateStr, index, "ticketType"]}
              rules={[
                { required: true, message: "Please select a ticket type" },
              ]}
            >
              <Select
                options={ticketOptions}
                value={slot.ticketType}
                onChange={(value) =>
                  handleTimeChange(dateStr, index, "ticketType", value)
                }
                style={{ width: "100%" }}
                placeholder="Select Ticket Type"
                disabled={!timeSlots[dateStr]?.[index]?.end_time}
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
