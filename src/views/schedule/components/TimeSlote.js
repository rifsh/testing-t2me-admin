import React from "react";
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
  Checkbox,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { updateTimeSlot } from "store/slices/scheduleSlice";
import { useDispatch } from "react-redux";
import TimeSlotValidator from "../utils/TimeSloteValidator";
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
  const dispatch = useDispatch();

  const shouldShowAddButton = () => {
    const currentDateSlots = timeSlots[dateStr] || [];
    if (currentDateSlots.length === 0) {
      return true;
    }

    const lastSlot = currentDateSlots[currentDateSlots.length - 1];
    const isLastSlotComplete =
      lastSlot.start_time && lastSlot.end_time && lastSlot.ticketType;

    return (
      isLastSlotComplete &&
      !TimeSlotValidator.hasFormErrors(form, dateStr) &&
      !TimeSlotValidator.isFullDayCovered(timeSlots, dateStr)
    );
  };

  const handleTimeChange = async (
    dateStr,
    index,
    type,
    value,
    eventType = "change"
  ) => {
    if (eventType === "select") {
      clearFormTimeSlot(dateStr, index, type);
      return;
    }

    if (type === "start_time" || type === "end_time") {
      const validationResult = TimeSlotValidator.validateTimeSlot(
        timeSlots,
        dateStr,
        form,
        value,
        index,
        type
      );

      if (!validationResult.isValid) {
        message.error(validationResult.message);
        clearFormTimeSlot(dateStr, index, type);

        if (type === "start_time") {
          clearFormTimeSlot(dateStr, index, "end_time");
          clearFormTimeSlot(dateStr, index, "is_midnight_passed");
        }
        return;
      }

      if (validationResult.isValid && validationResult.isWarning) {
        Modal.confirm({
          title: "Warning",
          content: validationResult.message,
          okText: "Continue",
          cancelText: "Cancel",
          onOk: () => {
            updateCurrentTimeSlot(dateStr, index, type, value);
            if (validationResult.affectedSlots) {
              clearAffectedSlots(dateStr, validationResult.affectedSlots);
            }
            if (validationResult.clearFields) {
              validationResult.clearFields.forEach((field) => {
                clearFormTimeSlot(dateStr, index, field);
              });
            }
          },
          onCancel: () => {
            clearFormTimeSlot(dateStr, index, type);
            if (type === "start_time") {
              clearFormTimeSlot(dateStr, index, "end_time");
              clearFormTimeSlot(dateStr, index, "is_midnight_passed");
            }
          },
        });
        return;
      }
    }

    updateCurrentTimeSlot(dateStr, index, type, value);
  };

  const handleMidnightPassedChange = (dateStr, index, checked) => {
    const currentSlot = timeSlots[dateStr]?.[index];

    // Check if start time is set
    if (!currentSlot?.start_time) {
      message.error("Please set start time before enabling midnight passed");
      clearFormTimeSlot(dateStr, index, "is_midnight_passed");
      return;
    }

    // If enabling midnight passed
    if (checked) {
      // Check if this is the last day of the event
      const eventDates = Object.keys(timeSlots).sort();
      const isLastDay = dateStr === eventDates[eventDates.length - 1];

      if (isLastDay) {
        Modal.error({
          title: "Cannot Enable Midnight Passed",
          content:
            "You cannot enable midnight passed on the last day of the event as there are no subsequent days available.",
          okText: "OK",
          cancelText: "Cancel",
          onOk: () => {
            clearFormTimeSlot(dateStr, index, "is_midnight_passed");
          },
          onCancel: () => {
            clearFormTimeSlot(dateStr, index, "is_midnight_passed");
          },
        });
        return;
      }

      // Show warning about next day implications
      Modal.confirm({
        title: "Enable Midnight Passed",
        content:
          "Enabling this option means the end time will be on the next day. You can only select end times before the start time. Do you want to continue?",
        okText: "Continue",
        cancelText: "Cancel",
        onOk: () => {
          updateCurrentTimeSlot(dateStr, index, "is_midnight_passed", checked);
          // Clear end time if it exists and is after start time
          if (currentSlot.end_time) {
            const startTimeMinutes = TimeSlotValidator.timeToMinutes(
              currentSlot.start_time.format("HH:mm")
            );
            const endTimeMinutes = TimeSlotValidator.timeToMinutes(
              currentSlot.end_time.format("HH:mm")
            );

            if (endTimeMinutes > startTimeMinutes) {
              clearFormTimeSlot(dateStr, index, "end_time");
            }
          }
        },
        onCancel: () => {
          clearFormTimeSlot(dateStr, index, "is_midnight_passed");
        },
      });
      return;
    }

    // If disabling midnight passed
    if (!checked && currentSlot?.end_time) {
      const startTimeMinutes = TimeSlotValidator.timeToMinutes(
        currentSlot.start_time.format("HH:mm")
      );
      const endTimeMinutes = TimeSlotValidator.timeToMinutes(
        currentSlot.end_time.format("HH:mm")
      );

      if (endTimeMinutes < startTimeMinutes) {
        Modal.confirm({
          title: "Warning",
          content:
            "Disabling midnight passed will clear the end time as it's currently set to next day",
          okText: "Continue",
          cancelText: "Cancel",
          onOk: () => {
            updateCurrentTimeSlot(
              dateStr,
              index,
              "is_midnight_passed",
              checked
            );
            clearFormTimeSlot(dateStr, index, "end_time");
          },
          onCancel: () => {
            form.setFields([
              {
                name: ["timeSlots", dateStr, index, "is_midnight_passed"],
                value: true,
              },
            ]);
          },
        });
        return;
      }
    }

    updateCurrentTimeSlot(dateStr, index, "is_midnight_passed", checked);
  };

  const clearFormTimeSlot = (dateStr, index, type) => {
    form.setFields([
      {
        name: ["timeSlots", dateStr, index, type],
        value: null,
      },
    ]);

    dispatch(
      updateTimeSlot({
        dateStr,
        index,
        field: type,
        value: null,
      })
    );
  };

  const clearAffectedSlots = (dateStr, affectedSlots) => {
    const fieldUpdates = affectedSlots.map((slot) => ({
      name: ["timeSlots", dateStr, slot.index],
      value: {
        ...slot,
        start_time: null,
        end_time: null,
        is_midnight_passed: false,
      },
    }));

    form.setFields(fieldUpdates);

    affectedSlots.forEach((slot) => {
      dispatch(
        updateTimeSlot({
          dateStr,
          index: slot.index,
          field: "start_time",
          value: null,
        })
      );

      dispatch(
        updateTimeSlot({
          dateStr,
          index: slot.index,
          field: "end_time",
          value: null,
        })
      );

      dispatch(
        updateTimeSlot({
          dateStr,
          index: slot.index,
          field: "is_midnight_passed",
          value: false,
        })
      );
    });
  };

  const updateCurrentTimeSlot = (dateStr, index, type, value) => {
    form.setFields([
      {
        name: ["timeSlots", dateStr, index, type],
        value: value,
      },
    ]);

    dispatch(
      updateTimeSlot({
        dateStr,
        index,
        field: type,
        value,
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
          <Col span={4}>
            <Form.Item
              name={["timeSlots", dateStr, index, "start_time"]}
              label="Start Time"
              rules={[{ required: true, message: "Please select start time" }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.start_time}
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

          <Col span={4}>
            <Form.Item
              name={["timeSlots", dateStr, index, "is_midnight_passed"]}
              label="Midnight Passed"
              valuePropName="checked"
            >
              <Checkbox
                value={false}
                disabled={!slot.start_time}
                onChange={(e) =>
                  handleMidnightPassedChange(dateStr, index, e.target.checked)
                }
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              name={["timeSlots", dateStr, index, "end_time"]}
              label="End Time"
              rules={[{ required: true, message: "Please select end time" }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.end_time}
                onSelect={(time) =>
                  handleTimeChange(dateStr, index, "end_time", time, "select")
                }
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "end_time", time, "change")
                }
                style={{ width: "100%" }}
                placeholder="End Time"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
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

      {shouldShowAddButton() && (
        <Button
          type="dashed"
          onClick={() => onAddSlot(dateStr)}
          icon={<PlusOutlined />}
          block
          style={{ marginTop: 16 }}
        >
          Add Time Slot
        </Button>
      )}

      {!shouldShowAddButton() && timeSlots[dateStr]?.length > 0 && (
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            color: "#ff4d4f",
            fontSize: "14px",
          }}
        >
          {TimeSlotValidator.isFullDayCovered(timeSlots, dateStr)
            ? "All time slots for the day are filled"
            : "Please complete all required fields in existing time slots before adding a new one"}
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
