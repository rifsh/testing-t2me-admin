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
  Modal,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { updateTimeSlot } from "store/slices/scheduleSlice";
import { useDispatch } from "react-redux";
import { ScheduleTimeUtil } from "../utils/ScheduleTime";

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
  // useEffect(() => {
  //   const slots = form.getFieldValue(["timeSlots", dateStr]) || [];
  //   if (slots.length > 0) {
  //     validateAllSlots(dateStr, slots);
  //   }
  // }, [bookingStartTime, eventStartTime, dateStr]);
  // useEffect(() => {
  //   form.getFieldValue(["timeSlots", dateStr]) || []
  // }, [dateStr]);

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
          bookingStartTime.format("YYYY-MM-DD") ===
          eventStartTime.format("YYYY-MM-DD")
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
      const maxDurationMinutes = 1440; // 24 hours
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
  const dispatch = useDispatch();

  const handleTimeChange = (
    dateStr,
    index,
    type,
    value,
    eventType = "change"
  ) => {
    // 1. Handle Select Event
    if (eventType === "select") {
      return;
    }

    // 2. Process Time Value
    const timeValue = value
      ? type === "ticketType"
        ? value
        : value.tz(getEventTimezone())
      : null;

    // 3. Validate Time-related Changes
    if (type === "start_time" || type === "end_time") {
      const validationResult = ScheduleTimeUtil.validateTimeSlote(
        timeSlots,
        dateStr,
        form,
        value,
        index,
        type
      );

      // 4. Handle Invalid Time
      if (!validationResult.isValid) {
        message.error(validationResult.message);
        // Clear form field
        form.setFieldsValue({
          timeSlots: {
            [dateStr]: {
              [index]: {
                [type]: null,
              },
            },
          },
        });
        // Clear state
        dispatch(
          updateTimeSlot({
            dateStr,
            index,
            field: type,
            value: null,
          })
        );
        return;
      }

      // 5. Handle Warning Cases
      if (validationResult.isValid && validationResult.isWarning) {
        Modal.confirm({
          title: "Warning",
          content: validationResult.message,
          onOk: () => {
            // 5.1 Clear Subsequent Slots (Both Form and State)
            const updatedTimeSlots = [...timeSlots[dateStr]];
            for (let i = index + 1; i < updatedTimeSlots.length; i++) {
              // Batch form updates
              const formUpdates = {
                timeSlots: {
                  [dateStr]: {
                    [i]: {
                      start_time: null,
                      end_time: null,
                    },
                  },
                },
              };
              form.setFieldsValue(formUpdates);

              // Batch state updates
              dispatch(
                updateTimeSlot({
                  dateStr,
                  index: i,
                  field: "start_time",
                  value: null,
                })
              );
              dispatch(
                updateTimeSlot({
                  dateStr,
                  index: i,
                  field: "end_time",
                  value: null,
                })
              );
            }

            // 5.2 Update Current Slot
            dispatch(
              updateTimeSlot({
                dateStr,
                index,
                field: type,
                value: timeValue,
              })
            );
          },
          onCancel: () => {
            // 5.3 Clear Current Field (Both Form and State)
            form.setFieldsValue({
              timeSlots: {
                [dateStr]: {
                  [index]: {
                    [type]: null,
                  },
                },
              },
            });
            dispatch(
              updateTimeSlot({
                dateStr,
                index,
                field: type,
                value: null,
              })
            );
          },
        });
        return;
      }
    }

    // 6. Default Case: Update Time Slot
    dispatch(
      updateTimeSlot({
        dateStr,
        index,
        field: type,
        value: timeValue,
      })
    );
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
                onSelect={(time) =>
                  handleTimeChange(dateStr, index, "start_time", time, "select")
                }
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "start_time", time, "change")
                }
                style={{ width: "100%" }}
                placeholder="Start Time"
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
                onSelect={(time) =>
                  handleTimeChange(dateStr, index, "end_time", time)
                }
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "end_time", time)
                }
                style={{ width: "100%" }}
                placeholder="End Time"
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
