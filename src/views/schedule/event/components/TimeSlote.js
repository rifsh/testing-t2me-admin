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
  Cascader,
  DatePicker,
  Alert,
  Typography,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  CopyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { updateTimeSlot } from "store/slices/scheduleSlice";
import { useDispatch, useSelector } from "react-redux";
import TimeSlotValidator from "../utils/TimeSloteValidator";
import dayjs from "dayjs";

const { Text } = Typography;
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
  eventDetails,
  availableSeats,
}) => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const { selectedTicketType } = useSelector((state) => state.tickets);
  const getDateCoverage = (timeSlots = {}, dateStr) => {
    if (!dateStr) {
      return {
        isFullyCovered: false,
        partialCoverage: null,
        availableFrom: null,
        isLastDateMidnightPassed: false,
      };
    }

    const allDates = Object.keys(timeSlots).sort();
    const coverage = {
      isFullyCovered: false,
      partialCoverage: null,
      availableFrom: null,
      isLastDateMidnightPassed: false,
    };

    // Check current date slots
    const currentDateSlots = timeSlots[dateStr] || [];
    if (currentDateSlots.length > 0) {
      const lastSlot = currentDateSlots[currentDateSlots.length - 1];
      if (lastSlot?.is_midnight_passed) {
        coverage.isLastDateMidnightPassed = true;
        if (lastSlot.show_end_date) {
          const showEndDate = dayjs(lastSlot.show_end_date);
          if (showEndDate.isAfter(dayjs(dateStr), "day")) {
            coverage.isFullyCovered = true;
          }
        }
      }
    }

    // Check previous dates coverage
    for (const date of allDates) {
      if (dayjs(date).isAfter(dayjs(dateStr))) break;

      const slots = timeSlots[date] || [];
      for (const slot of slots) {
        if (slot?.is_midnight_passed && slot?.show_end_date) {
          const showEndDate = dayjs(slot.show_end_date);
          const currentDate = dayjs(dateStr);

          if (showEndDate.isSame(currentDate, "day")) {
            coverage.partialCoverage = true;
            coverage.availableFrom = showEndDate;
          } else if (showEndDate.isAfter(currentDate, "day")) {
            coverage.isFullyCovered = true;
            return coverage;
          }
        }
      }
    }

    return coverage;
  };

  const shouldShowTimeSlots = () => {
    const currentDateSlots = timeSlots[dateStr] || [];
    const hasMidnightPassedSlots = currentDateSlots.some(
      (slot) => slot.is_midnight_passed
    );

    return !coverage.isFullyCovered || hasMidnightPassedSlots;
  };

  const shouldShowAddButton = () => {
    const coverage = getDateCoverage(timeSlots, dateStr);
    if (coverage.isFullyCovered || coverage.isLastDateMidnightPassed)
      return false;

    const currentDateSlots = timeSlots[dateStr] || [];
    if (currentDateSlots.length === 0) return true;

    return true;
  };

  const coverage = getDateCoverage(timeSlots, dateStr);

  const handleShowEndTime = (
    dateStr,
    index,
    type,
    value,
    eventType = "change"
  ) => {
    if (eventType === "select" || !value) {
      clearSlotFields(dateStr, index, [type]);
      return;
    }
    console.log(value, "showendtimevaue");

    const validation = TimeSlotValidator.validateShowEndTime(
      timeSlots,
      dateStr,
      index,
      value,
      form.getFieldsValue()
    );

    if (!validation.isValid) {
      message.error(validation.message);
      clearSlotFields(dateStr, index, [type]);
      return;
    }

    if (validation.warning) {
      Modal.confirm({
        title: "Warning: Overlapping Time Slots Detected",
        content: (
          <div>
            <p>{validation.message}</p>
            <p>The following slots will be affected:</p>
            <ul>
              {validation.conflictingSlots.map((slot, idx) => (
                <li key={idx}>
                  Date: {slot.originalStartDate} to {slot.originalEndDate}
                </li>
              ))}
            </ul>
            <p>
              These overlapping slots will be cleared. Do you want to continue?
            </p>
          </div>
        ),
        okText: "Continue and Clear Overlaps",
        cancelText: "Cancel",
        onOk: () => {
          // Clear conflicting slots
          validation.conflictingSlots.forEach((slot) => {
            clearSlotFields(slot.date, slot.index, [
              "start_time",
              "end_time",
              "is_midnight_passed",
              "show_end_date",
              "ticketType",
              "seat_structure_id",
            ]);
          });

          // Update current slot
          batchUpdate([
            {
              dateStr,
              index,
              field: type,
              value,
            },
          ]);
        },
        onCancel: () => {
          clearSlotFields(dateStr, index, [type]);
        },
      });
      return;
    }

    // If no conflicts, update normally
    batchUpdate([
      {
        dateStr,
        index,
        field: type,
        value,
      },
    ]);
  };

  // Helper function to clear slot fields (remains the same)
  const clearSlotFields = (dateStr, index, fields) => {
    const updates = fields.map((field) => ({
      dateStr,
      index,
      field,
      value: field === "is_midnight_passed" ? false : null,
    }));
    batchUpdate(updates);
  };

  // Helper function to batch update time slots (remains the same)
  const batchUpdate = (updates) => {
    const formUpdates = updates.map(({ dateStr, index, field, value }) => ({
      name: ["timeSlots", dateStr, index, field],
      value: field === "is_midnight_passed" ? !!value : value,
    }));

    form.setFields(formUpdates);
    updates.forEach((update) => dispatch(updateTimeSlot(update)));
    console.log(timeSlots, "timeslotes");
    console.log(form.getFieldValue(), "timeslotes");
  };

  const handleTimeChange = async (
    dateStr,
    index,
    type,
    value,
    eventType = "change"
  ) => {
    if (eventType === "select") {
      clearSlotFields(dateStr, index, [type]);
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
        const fieldsToClear = [type];
        if (type === "start_time") {
          fieldsToClear.push("end_time", "is_midnight_passed", "show_end_date");
        }
        clearSlotFields(dateStr, index, fieldsToClear);
        return;
      }

      if (validationResult.isValid && validationResult.isWarning) {
        Modal.confirm({
          title: "Warning",
          content: validationResult.message,
          okText: "Continue",
          cancelText: "Cancel",
          onOk: () => {
            batchUpdate([{ dateStr, index, field: type, value }]);
            if (validationResult.affectedSlots) {
              validationResult.affectedSlots.forEach((slot) => {
                clearSlotFields(dateStr, slot.index, [
                  "start_time",
                  "end_time",
                  "is_midnight_passed",
                  "show_end_date",
                  "ticketType",
                  "seat_structure_id",
                ]);
              });
            }
          },
          onCancel: () => {
            const fieldsToClear = [type];
            if (type === "start_time") {
              fieldsToClear.push(
                "end_time",
                "is_midnight_passed",
                "show_end_date"
              );
            }
            clearSlotFields(dateStr, index, fieldsToClear);
          },
        });
        return;
      }
      batchUpdate([{ dateStr, index, field: type, value }]);
    }
    if (type === "ticketType" || type === "seat_structure_id") {
      console.log(value, "dsfjakljflsjfka");

      batchUpdate([{ dateStr, index, field: type, value }]);
    }
  };

  const handleMidnightPassedChange = (dateStr, index, checked) => {
    const currentSlot = timeSlots[dateStr]?.[index];

    if (!currentSlot?.start_time) {
      message.error("Please set start time before enabling midnight passed");
      clearSlotFields(dateStr, index, ["is_midnight_passed"]);
      return;
    }

    if (checked) {
      const eventDates = Object.keys(timeSlots).sort();
      const isLastDay = dateStr === eventDates[eventDates.length - 1];

      if (isLastDay) {
        Modal.error({
          title: "Cannot Enable Midnight Passed",
          content:
            "Cannot enable midnight passed on the last day of the event.",
          onOk: () => clearSlotFields(dateStr, index, ["is_midnight_passed"]),
        });
        return;
      }

      Modal.confirm({
        title: "Enable Midnight Passed",
        content:
          "Enabling this option means the end time will be on the next day. You can only select end times before the start time. Do you want to continue?",
        onOk: () => {
          const updates = [
            { dateStr, index, field: "end_time", value: null },
            { dateStr, index, field: "is_midnight_passed", value: checked },
            { dateStr, index, field: "show_end_date", value: null },
          ];
          batchUpdate(updates);
        },
        onCancel: () => clearSlotFields(dateStr, index, ["is_midnight_passed"]),
      });
      return;
    }

    // Handle unchecking midnight passed
    Modal.confirm({
      title: "Warning",
      content: "Disabling midnight passed will clear related fields. Continue?",
      onOk: () => {
        clearSlotFields(dateStr, index, [
          "is_midnight_passed",
          "show_end_date",
          "end_time",
        ]);
      },
      onCancel: () => {
        batchUpdate([
          { dateStr, index, field: "is_midnight_passed", value: true },
        ]);
      },
    });
  };

  // const batchUpdate = (updates) => {
  //   const formUpdates = updates.map(({ dateStr, index, field, value }) => ({
  //     name: ["timeSlots", dateStr, index, field],
  //     value: field === "is_midnight_passed" ? !!value : value,
  //   }));

  //   form.setFields(formUpdates);
  //   updates.forEach((update) => dispatch(updateTimeSlot(update)));
  //   console.log(timeSlots, "timeslotes");
  //   console.log(form.getFieldValue(), "timeslotes");
  // };

  // // Helper function to clear slot fields
  // const clearSlotFields = (dateStr, index, fields) => {
  //   const updates = fields.map((field) => ({
  //     dateStr,
  //     index,
  //     field,
  //     value: field === "is_midnight_passed" ? false : null,
  //   }));
  //   batchUpdate(updates);
  // };

  const displayRender = (label) => label.join(" / ");

  return (
    <div className="space-y-4">
      {coverage.isFullyCovered && !coverage.isLastDateMidnightPassed && (
        <Alert
          message="This date is fully covered by previous time slots"
          type="success"
          showIcon
        />
      )}

      {coverage.partialCoverage &&
        !coverage.isFullyCovered &&
        coverage.availableFrom && (
          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                <Text>
                  Time slots can be added after{" "}
                  <Text strong>{coverage.availableFrom.format("HH:mm")}</Text>{" "}
                  for this date
                </Text>
              </Space>
            }
            type="info"
            className="mb-4"
          />
        )}

      {/* Show time slots if either not fully covered OR has midnight passed slots */}
      {shouldShowTimeSlots() && (
        <>
          {timeSlots[dateStr]?.map((slot, index) => (
            <Row
              key={index}
              gutter={[16, 16]}
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col span={5}>
                <Form.Item
                  name={["timeSlots", dateStr, index, "start_time"]}
                  label="Start Time"
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <TimePicker
                    format="HH:mm"
                    value={slot.start_time}
                    onSelect={(time) =>
                      handleTimeChange(
                        dateStr,
                        index,
                        "start_time",
                        time,
                        "select"
                      )
                    }
                    onChange={(time) =>
                      handleTimeChange(
                        dateStr,
                        index,
                        "start_time",
                        time,
                        "change"
                      )
                    }
                    style={{ width: "100%" }}
                    placeholder="Start Time"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name={["timeSlots", dateStr, index, "is_midnight_passed"]}
                  label=" "
                  valuePropName="checked"
                  initialValue={slot.is_midnight_passed || false}
                >
                  <Checkbox
                    checked={slot.is_midnight_passed || false}
                    disabled={!slot.start_time}
                    onChange={(e) =>
                      handleMidnightPassedChange(
                        dateStr,
                        index,
                        e.target.checked
                      )
                    }
                  >
                    <span>Midnight Passed</span>
                  </Checkbox>
                </Form.Item>
              </Col>
              {!form.getFieldValue([
                "timeSlots",
                dateStr,
                index,
                "is_midnight_passed",
              ]) && (
                <Col span={5}>
                  <Form.Item
                    name={["timeSlots", dateStr, index, "end_time"]}
                    label="End Time"
                    rules={[
                      { required: true, message: "Please select end time" },
                    ]}
                    validateTrigger={["onChange", "onBlur"]}
                  >
                    <TimePicker
                      format="HH:mm"
                      value={slot.end_time}
                      onSelect={(time) =>
                        handleTimeChange(
                          dateStr,
                          index,
                          "end_time",
                          time,
                          "select"
                        )
                      }
                      onChange={(time) =>
                        handleTimeChange(
                          dateStr,
                          index,
                          "end_time",
                          time,
                          "change"
                        )
                      }
                      style={{ width: "100%" }}
                      placeholder="End Time"
                    />
                  </Form.Item>
                </Col>
              )}
              {form.getFieldValue([
                "timeSlots",
                dateStr,
                index,
                "is_midnight_passed",
              ]) && (
                <Col span={5}>
                  <Form.Item
                    name={["timeSlots", dateStr, index, "show_end_date"]}
                    label="Show End Time"
                    rules={[
                      {
                        required: true,
                        message: "Please select show end time",
                      },
                    ]}
                    validateTrigger={["onChange", "onBlur"]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD HH:mm"
                      showTime={{ format: "HH:mm" }}
                      value={slot.show_end_date}
                      onSelect={(time) =>
                        handleShowEndTime(
                          dateStr,
                          index,
                          "show_end_date",
                          time,
                          "select"
                        )
                      }
                      onChange={(time) =>
                        handleShowEndTime(
                          dateStr,
                          index,
                          "show_end_date",
                          time,
                          "change"
                        )
                      }
                      style={{ width: "100%" }}
                      placeholder="End Time"
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={5}>
                {selectedTicketType === "seat_structure" ? (
                  <Form.Item
                    label="Seat Structure"
                    name={["timeSlots", dateStr, index, "seat_structure_id"]}
                    rules={[
                      {
                        required: true,
                        message: "Please select a seat structure",
                      },
                    ]}
                  >
                    <Select
                      className="w-100"
                      placeholder="Choose seats"
                      onChange={(value) => {
                        handleTimeChange(
                          dateStr,
                          index,
                          "seat_structure_id",
                          value
                        );
                      }}
                      showSearch
                    >
                      {Array.isArray(availableSeats)
                        ? availableSeats.map((seat) => (
                            <Option key={seat.id} value={seat.id}>
                              {seat.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item
                    label="Ticket Type"
                    name={["timeSlots", dateStr, index, "ticketType"]}
                    rules={[
                      {
                        required: true,
                        message: "Please select a ticket type",
                      },
                    ]}
                  >
                    <Cascader
                      options={ticketOptions}
                      expandTrigger="click"
                      displayRender={displayRender}
                      onChange={(value) => {
                        handleTimeChange(dateStr, index, "ticketType", value);
                      }}
                      placeholder="Select Ticket Type"
                      style={{ width: "100%" }}
                      changeOnSelect={false}
                      notFoundContent="No ticket types available"
                    />
                  </Form.Item>
                )}
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
                    disabled={form.getFieldValue([
                      "timeSlots",
                      dateStr,
                      index,
                      "is_midnight_passed",
                    ])}
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
              className="mt-4"
            >
              Add Time Slot
            </Button>
          )}
        </>
      )}

      {coverage.isLastDateMidnightPassed && (
        <Alert
          message="You can't add more time slots as the last slot extends past midnight"
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

export default TimeSlots;
