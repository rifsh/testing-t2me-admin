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
import dayjs from "dayjs";

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
  // Watch for changes in booking start time and event start time
  useEffect(() => {
    const slots = form.getFieldValue(["timeSlots", dateStr]) || [];
    if (slots.length > 0) {
      validateAllSlots(dateStr, slots);
    }
  }, [bookingStartTime, eventStartTime, dateStr]);

  const validateAllSlots = (dateStr, slots) => {
    slots.forEach((slot, index) => {
      if (slot.start_time) {
        validateTimeSequence(
          dateStr,
          index,
          "start_time",
          slot.start_time,
          slots,
          true
        );
      }
      if (slot.end_time) {
        validateTimeSequence(
          dateStr,
          index,
          "end_time",
          slot.end_time,
          slots,
          true
        );
      }
    });
  };
  const validateTimeSlots = (
    dateStr,
    slots,
    form,
    eventStartTime,
    bookingStartTime
  ) => {
    if (!slots?.length) return { valid: true };

    // Filter out empty slots and sort by start time
    const validSlots = slots
      .filter((slot) => slot.start_time && slot.end_time)
      .sort((a, b) => a.start_time.valueOf() - b.start_time.valueOf());

    if (!validSlots.length) return { valid: true };

    const errors = [];
    const isFirstDay = dateStr === eventStartTime?.format("YYYY-MM-DD");

    // Validate each slot
    validSlots.forEach((slot, index) => {
      const { start_time, end_time } = slot;

      // Check if end time is after start time
      if (end_time.isSameOrBefore(start_time)) {
        errors.push({
          field: ["timeSlots", dateStr, index, "end_time"],
          message: "End time must be after start time",
        });
      }

    // First show on first day validation
if (isFirstDay && index === 0 && bookingStartTime) {
    // Check if booking start date and event start date are the same day
    if (
      bookingStartTime.format('YYYY-MM-DD') === eventStartTime.format('YYYY-MM-DD')
    ) {
      if (start_time.isBefore(bookingStartTime)) {
        errors.push({
          field: ["timeSlots", dateStr, index, "start_time"],
          message: "First show must start after booking start time",
        });
      }
    }
  }

      // Check for overlap with next slot
      if (index < validSlots.length - 1) {
        const nextSlot = validSlots[index + 1];
        if (end_time.isAfter(nextSlot.start_time)) {
          errors.push({
            field: ["timeSlots", dateStr, index, "end_time"],
            message: "Time slots cannot overlap",
          });
        }

        // Check for minimum gap between shows
        const minGapMinutes = 0;
        const gapMinutes = nextSlot.start_time.diff(end_time, "minutes");
        if (gapMinutes < minGapMinutes) {
          errors.push({
            field: ["timeSlots", dateStr, index + 1, "start_time"],
            message: `Minimum ${minGapMinutes} minutes gap required between shows`,
          });
        }
      }

      // Validate show duration
      const minDurationMinutes = 0;
      const maxDurationMinutes = 300; // 5 hours
      const durationMinutes = end_time.diff(start_time, "minutes");

      if (durationMinutes < minDurationMinutes) {
        errors.push({
          field: ["timeSlots", dateStr, index, "end_time"],
          message: `Show must be at least ${minDurationMinutes} minutes long`,
        });
      }

      if (durationMinutes > maxDurationMinutes) {
        errors.push({
          field: ["timeSlots", dateStr, index, "end_time"],
          message: `Show cannot exceed ${maxDurationMinutes} minutes`,
        });
      }
    });

    // Update form errors
    if (errors.length) {
      errors.forEach(({ field, message }) => {
        form.setFields([
          {
            name: field,
            errors: [message],
          },
        ]);
      });
      return { valid: false, errors };
    }

    // Clear any existing errors
    validSlots.forEach((_, index) => {
      ["start_time", "end_time"].forEach((field) => {
        form.setFields([
          {
            name: ["timeSlots", dateStr, index, field],
            errors: [],
          },
        ]);
      });
    });

    return { valid: true };
  };

  // Helper function to apply validation on time change
  const handleTimeChange = (dateStr, index, type, value) => {
    const timeValue = value ? (type === "ticketType" ? value : value.tz(getEventTimezone())) : null;

    // Create copy of current slots
    const currentSlots = [...(timeSlots[dateStr] || [])];

    // For start_time, calculate end_time
    let endTimeValue = null;
    // if (type === "start_time" && timeValue) {
    //   endTimeValue = timeValue.clone();
    // }

    // Update the specific slot
    currentSlots[index] = {
      ...currentSlots[index],
      [type]: timeValue,
      ...(type === "start_time" && { end_time: endTimeValue }),
    };

    // Update state and form
    setTimeSlots((prev) => ({
      ...prev,
      [dateStr]: currentSlots,
    }));

    // Update form values
    const formFields = [
      {
        name: ["timeSlots", dateStr, index, type],
        value: timeValue,
        errors: [],
      }
    ];

    // Add end_time update for start_time
    if (type === "start_time") {
      formFields.push({
        name: ["timeSlots", dateStr, index, "end_time"],
        value: endTimeValue,
        errors: [],
      });
    }

    form.setFields(formFields);

    validateTimeSlots(
      dateStr,
      currentSlots,
      form,
      eventStartTime,
      bookingStartTime
    );
};
  const clearInvalidTime = (dateStr, index, type) => {
    const formPath = ["timeSlots", dateStr, index];

    if (type === "start_time") {
      form.setFields([
        {
          name: [...formPath, "start_time"],
          value: null,
          errors: [],
        },
        {
          name: [...formPath, "end_time"],
          value: null,
          errors: [],
        },
      ]);

      setTimeSlots((prev) => ({
        ...prev,
        [dateStr]: prev[dateStr].map((slot, i) =>
          i === index ? { ...slot, start_time: null, end_time: null } : slot
        ),
      }));
    } else {
      form.setFields([
        {
          name: [...formPath, type],
          value: null,
          errors: [],
        },
      ]);

      setTimeSlots((prev) => ({
        ...prev,
        [dateStr]: prev[dateStr].map((slot, i) =>
          i === index ? { ...slot, [type]: null } : slot
        ),
      }));
    }
  };
  //   const handleTimeChange = (dateStr, index, type, value) => {
  //     // Convert the selected time to the event timezone if it's a time value
  //     const timeValue =
  //       (type === "start_time" || type === "end_time") && value
  //         ? value.tz(getEventTimezone())
  //         : value;

  //     // Get all current time slots
  //     const currentSlots = form.getFieldValue(["timeSlots", dateStr]) || [];

  //     // Create updated slots
  //     const updatedSlots = currentSlots.map((slot, i) =>
  //       i === index ? { ...slot, [type]: timeValue } : slot
  //     );

  //     // Validate before updating
  //     const isValid = validateTimeSequence(
  //       dateStr,
  //       index,
  //       type,
  //       timeValue,
  //       updatedSlots
  //     );

  //     if (isValid) {
  //       // Update form
  //       form.setFieldsValue({
  //         timeSlots: {
  //           ...form.getFieldValue("timeSlots"),
  //           [dateStr]: updatedSlots,
  //         },
  //       });
  //     } else {
  //       // Clear the invalid value
  //       clearInvalidTime(dateStr, index, type);
  //     }
  //   };

  const validateTimeSequence = (
    dateStr,
    index,
    type,
    value,
    slots,
    isSystemCheck = false
  ) => {
    if (!value) return true;

    const currentSlot = slots[index];
    const previousSlot = index > 0 ? slots[index - 1] : null;
    const nextSlot = index < slots.length - 1 ? slots[index + 1] : null;
    const isFirstDayFirstShow =
      dateStr === eventStartTime?.format("YYYY-MM-DD") && index === 0;

    let errorMessage = null;

    // Special validation for first day first show
    if (isFirstDayFirstShow && type === "start_time") {
      if (
        bookingStartTime?.format("YYYY-MM-DD") ===
        eventStartTime?.format("YYYY-MM-DD")
      ) {
        if (value.isBefore(bookingStartTime)) {
          errorMessage = "First show must start after booking start time";
        }
      }
    } else if (!isFirstDayFirstShow && type === "start_time") {
      // For non-first shows, check against previous slot
      if (previousSlot?.end_time && value.isBefore(previousSlot.end_time)) {
        errorMessage = "Start time must be after previous slot end time";
      }
    }

    // Common validations for all slots
    if (
      type === "start_time" &&
      currentSlot.end_time &&
      value.isAfter(currentSlot.end_time)
    ) {
      errorMessage = "Start time must be before end time";
    } else if (type === "end_time") {
      if (currentSlot.start_time && value.isBefore(currentSlot.start_time)) {
        errorMessage = "End time must be after start time";
      } else if (nextSlot?.start_time && value.isAfter(nextSlot.start_time)) {
        errorMessage = "End time must be before next slot start time";
      }
    }

    if (errorMessage) {
      form.setFields([
        {
          name: ["timeSlots", dateStr, index, type],
          errors: [errorMessage],
        },
      ]);

      if (!isSystemCheck) {
        message.error(errorMessage);
      }
      return false;
    }

    // Clear errors if validation passes
    form.setFields([
      {
        name: ["timeSlots", dateStr, index, type],
        errors: [],
      },
    ]);

    return true;
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

        // Only apply booking start time restriction for first show on first day
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

        // Previous slot restrictions (only for non-first shows)
        if (
          !isFirstDayFirstShow &&
          type === "start_time" &&
          previousSlot?.end_time
        ) {
          for (let i = 0; i < previousSlot.end_time.hour(); i++) {
            hours.add(i);
          }
        }

        // End time restrictions based on start time
        if (type === "end_time" && currentSlot?.start_time) {
          for (let i = 0; i < currentSlot.start_time.hour(); i++) {
            hours.add(i);
          }
        }

        // Next slot restrictions for end time
        if (type === "end_time" && nextSlot?.start_time) {
          for (let i = nextSlot.start_time.hour(); i < 24; i++) {
            hours.add(i);
          }
        }

        return Array.from(hours);
      },
      disabledMinutes: (hour) => {
        const minutes = new Set();

        // First show booking start time minutes restriction
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

        // Previous slot minutes restriction (only for non-first shows)
        if (
          !isFirstDayFirstShow &&
          type === "start_time" &&
          previousSlot?.end_time &&
          previousSlot.end_time.hour() === hour
        ) {
          for (let i = 0; i <= previousSlot.end_time.minute(); i++) {
            minutes.add(i);
          }
        }

        // End time minutes restriction based on start_time time
        if (
          type === "end_time" &&
          currentSlot?.start_time &&
          currentSlot.start_time.hour() === hour
        ) {
          for (let i = 0; i < currentSlot.start_time.minute(); i++) {
            minutes.add(i);
          }
        }

        // Next slot minutes restriction for end_time time
        if (
          type === "end_time" &&
          nextSlot?.start_time &&
          nextSlot.start_time.hour() === hour
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
                onChange={(value) => {
                  console.log("Ticket Type Changed:", {
                    dateStr,
                    index,
                    value,
                    currentSlot: slot,
                  });
                  handleTimeChange(dateStr, index, "ticketType", value);
                }}
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
