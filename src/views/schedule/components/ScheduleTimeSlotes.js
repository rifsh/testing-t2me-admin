import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Form,
  DatePicker,
  Button,
  Typography,
  Row,
  Col,
  Space,
  message,
  Badge,
  Segmented,
  Modal,
} from "antd";
import {
  LeftOutlined,
  WarningOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetails } from "store/slices/eventSlice";

import {
  addNewTimeSlot,
  removeExistingTimeSlot,
  setActiveTab,
  setDates,
  setSlotStatus,
  setTimeSlots,
} from "store/slices/scheduleSlice";
import TimezoneClock from "components/util-components/timezone/TimeZoneClock";

import TimeSlots from "./TimeSlote";
import { ScheduleTimeValidator } from "../utils/ScheduleTimeValidator";

const { Title } = Typography;

// Extend_time dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export function ScheduleTimeSlots({ form }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const segmentRef = useRef(null);
  const timeZone = dayjs.tz.guess();
  const currentDateInTimeZone = useMemo(() => dayjs().tz(timeZone), [timeZone]);
  const dispatch = useDispatch();
  useEffect(() => {
    const eventId = 7;
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, form]);

  const { eventDetails } = useSelector((state) => state.event);
  const { timeSlots, activeTab, dates, slotStatus } = useSelector(
    (state) => state.schedules
  );
  useEffect(() => {
    const newSlotStatus = {};
    Object.entries(timeSlots).forEach(([date, slots]) => {
      // First, ensure slots is an array
      const slotsArray = Array.isArray(slots) ? slots : [];

      if (!slotsArray || slotsArray.length === 0) {
        newSlotStatus[date] = "yellow";
        return;
      }

      // Now safely use array methods
      const hasCompleteSlot = slotsArray.some(
        (slot) => slot && slot.start_time && slot.ticketType
      );

      if (hasCompleteSlot) {
        newSlotStatus[date] = "green";
      } else if (slotsArray.some((slot) => slot && slot.start_time)) {
        newSlotStatus[date] = "green";
      } else {
        newSlotStatus[date] = "red";
      }
    });
    dispatch(setSlotStatus(newSlotStatus));
  }, [timeSlots]);

  const applySlotToAllDates = (sourceDate, slotIndex) => {
    if (!sourceDate || !timeSlots[sourceDate]) {
      message.warning("Please set up time slots for the current date first");
      return;
    }

    const sourceSlot = timeSlots[sourceDate][slotIndex];
    console.log("Source Slot:", sourceSlot); // Debug log

    if (!sourceSlot.start_time) {
      message.warning("Please set a start time for the slot first");
      return;
    }
    const confirmDetails = [
      `Apply time slot ${sourceSlot.start_time.format("HH:mm")} - ${
        sourceSlot.end_time?.format("HH:mm") || "No end_time time"
      }`,
      `Ticket type: ${getTicketTypeName(sourceSlot.ticketType)}`,
      "This will overwrite any existing slots in the same position on other dates",
    ];

    Modal.confirm({
      title: "Confirm Apply to All Dates",
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>This action will:</p>
          <ul>
            {confirmDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
          <p>Are you sure you want to continue?</p>
        </div>
      ),
      okText: "Apply",
      cancelText: "Cancel",
      onOk: () => {
        const newTimeSlots = { ...timeSlots };
        const formValues = form.getFieldsValue();
        const newFormValues = { ...formValues };

        dates.forEach((date) => {
          if (date !== sourceDate) {
            const existingSlots = newTimeSlots[date] || [];
            const updatedSlots = [...existingSlots];

            const targetStart = sourceSlot.start_time
              ? dayjs(date)
                  .hour(sourceSlot.start_time.hour())
                  .minute(sourceSlot.start_time.minute())
              : null;

            const targetEnd = sourceSlot.end_time
              ? dayjs(date)
                  .hour(sourceSlot.end_time.hour())
                  .minute(sourceSlot.end_time.minute())
              : null;

            // Ensure slot exists
            while (updatedSlots.length <= slotIndex) {
              updatedSlots.push({ start_time: null, end_time: null });
            }

            updatedSlots[slotIndex] = {
              ...sourceSlot,
              start_time: targetStart,
              end_time: targetEnd,
              ticketType: sourceSlot.ticketType,
            };

            console.log("Updated Slot:", updatedSlots[slotIndex]); // Debug log

            // Update form values
            if (!newFormValues.timeSlots) {
              newFormValues.timeSlots = {};
            }
            if (!newFormValues.timeSlots[date]) {
              newFormValues.timeSlots[date] = [];
            }
            while (newFormValues.timeSlots[date].length <= slotIndex) {
              newFormValues.timeSlots[date].push({});
            }
            newFormValues.timeSlots[date][slotIndex] = {
              start_time: targetStart,
              end_time: targetEnd,
              ticketType: sourceSlot.ticketType,
            };

            // Validate time conflicts
            const validation = validateTimeConflicts(updatedSlots);
            if (!validation.valid) {
              message.error(`Conflict on ${date}: ${validation.message}`);
              return;
            }

            newTimeSlots[date] = updatedSlots;
          }
        });

        dispatch(setTimeSlots(newTimeSlots));
        form.setFieldsValue(newFormValues);
        message.success("Time slot applied to all dates successfully");
      },
    });
  };

  const applyAllSlotsToAllDates = () => {
    if (!activeTab || !timeSlots[activeTab]) {
      message.warning("Please set up time slots for the current date first");
      return;
    }

    const sourceSlots = timeSlots[activeTab];
    if (!sourceSlots.some((slot) => slot.start_time)) {
      message.warning("Please set at least one time slot first");
      return;
    }

    const confirmDetails = sourceSlots
      .filter((slot) => slot.start_time)
      .map(
        (slot) =>
          `Time: ${slot.start_time.format("HH:mm")} - ${
            slot.end_time?.format("HH:mm") || "No end_time time"
          }, ` + `Ticket: ${getTicketTypeName(slot.ticketType)}`
      );

    confirmDetails.push(
      "This will overwrite all existing slots on other dates"
    );

    Modal.confirm({
      title: "Confirm Apply to All Dates",
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>This action will:</p>
          <ul>
            {confirmDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
          <p>Are you sure you want to continue?</p>
        </div>
      ),
      okText: "Apply",
      cancelText: "Cancel",
      onOk: () => {
        const newTimeSlots = { ...timeSlots };
        const formValues = form.getFieldsValue();
        const newFormValues = { ...formValues };

        dates.forEach((date) => {
          if (date !== activeTab) {
            const updatedSlots = sourceSlots.map((slot) => {
              const targetStart = slot.start_time
                ? dayjs(date)
                    .hour(slot.start_time.hour())
                    .minute(slot.start_time.minute())
                : null;

              const targetEnd = slot.end_time
                ? dayjs(date)
                    .hour(slot.end_time.hour())
                    .minute(slot.end_time.minute())
                : null;

              return {
                ...slot,
                start_time: targetStart,
                end_time: targetEnd,
                ticketType: slot.ticketType, // Explicitly set the ticket type
              };
            });

            // Update form values
            if (!newFormValues.timeSlots) {
              newFormValues.timeSlots = {};
            }
            newFormValues.timeSlots[date] = updatedSlots.map((slot) => ({
              start_time: slot.start_time,
              end_time: slot.end_time,
              ticketType: slot.ticketType,
            }));

            // Validate time conflicts
            const validation = validateTimeConflicts(updatedSlots);
            if (!validation.valid) {
              message.error(`Conflict on ${date}: ${validation.message}`);
              return;
            }

            newTimeSlots[date] = updatedSlots;
          }
        });

        dispatch(setTimeSlots(newTimeSlots));
        form.setFieldsValue(newFormValues);
        message.success("All time slots applied to all dates successfully");
      },
    });
  };

  const validateTimeConflicts = (slots) => {
    // Ensure slots is an array
    const slotsArray = Array.isArray(slots) ? slots : [];

    if (!slotsArray || slotsArray.length === 0) return { valid: true };

    const sortedSlots = [...slotsArray]
      .filter((slot) => slot && slot.start_time)
      .sort((a, b) => a.start_time.valueOf() - b.start_time.valueOf());

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = sortedSlots[i];
      const nextSlot = sortedSlots[i + 1];

      if (
        currentSlot.end_time &&
        nextSlot.start_time &&
        currentSlot.end_time.isAfter(nextSlot.start_time)
      ) {
        return {
          valid: false,
          message: `Time conflict between slots: ${currentSlot.start_time.format(
            "HH:mm"
          )} - ${currentSlot.end_time.format(
            "HH:mm"
          )} and ${nextSlot.start_time.format(
            "HH:mm"
          )} - ${nextSlot.end_time?.format("HH:mm")}`,
        };
      }
    }

    return { valid: true };
  };

  const updateDateRange = (startDate, endDate) => {
    // if (!validateDateRange(startDate, endDate)) return;

    const newDates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isSameOrBefore(end, "day")) {
      newDates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    dispatch(setDates(newDates));
    dispatch(setActiveTab(newDates[0]));

    // Initialize time slots for new dates with array
    const initialTimeSlots = {};
    newDates.forEach((date) => {
      // Ensure we always have an array, even if empty
      initialTimeSlots[date] = Array.isArray(timeSlots[date])
        ? timeSlots[date]
        : [{ start_time: null, end_time: null }];
    });
    dispatch(setTimeSlots(initialTimeSlots));
  };

  const removeTimeSlot = (dateStr, index) => {
    dispatch(removeTimeSlot({ dateStr, index }));
  };
  const handleAddTimeSlot = (dateStr) => {
    dispatch(addNewTimeSlot({ dateStr }));
  };

  const handleRemoveTimeSlot = (dateStr, index) => {
    dispatch(removeExistingTimeSlot({ dateStr, index }));
  };

  const getTicketTypeName = (ticketTypeId) => {
    return (
      eventDetails?.event_ticket_structures?.find((t) => t.id === ticketTypeId)
        ?.ticket_structure?.name || "Not selected"
    );
  };

  const handleReset = () => {
    dispatch(setTimeSlots({}));
    dispatch(setDates([]));
    dispatch(setActiveTab(null));
  };

  const handleScroll = (direction) => {
    if (!segmentRef.current) return;

    const scrollAmount = 200;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    segmentRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  const renderTimeDateSegment = (dateStr) => ({
    label: (
      <Badge dot color={slotStatus[dateStr]} style={{ margin: 4 }}>
        <span style={{ padding: "0 4px" }} data-date={dateStr}>
          {dayjs(dateStr).format("MMM D, YYYY")}
        </span>
      </Badge>
    ),
    value: dateStr,
  });
  const ticketOptions = useMemo(() => {
    return (
      eventDetails?.event_ticket_structures?.map((ticketType) => ({
        value: ticketType.id,
        label: `${ticketType.ticket_structure.name} (${ticketType.ticket_set})`,
      })) || []
    );
  }, [eventDetails]);

  const renderTimeDateTimeSlots = (dateStr) => {
    return (
      <TimeSlots
        dateStr={dateStr}
        timeSlots={timeSlots}
        form={form}
        setTimeSlots={(newTimeSlots) => dispatch(setTimeSlots(newTimeSlots))}
        eventStartTime={form.getFieldValue("start_date")}
        bookingStartTime={form.getFieldValue("booking_start_date_time")}
        ticketOptions={ticketOptions}
        getEventTimezone={getEventTimezone}
        onAddSlot={handleAddTimeSlot}
        onRemoveSlot={handleRemoveTimeSlot}
        onApplyToAll={applySlotToAllDates}
      />
    );
  };

  const getEventTimezone = () => {
    return eventDetails?.venue?.place?.country?.time_zone || "America/New_York";
  };
  const handleScheduleDateChange = (field, date, eventType = "change") => {
    if (eventType === "select") {
      return;
    }

    console.log(`Date ${eventType} for ${field}:`, date);
    let validationResult = null;

    // Validation check based on field type
    const validationMap = {
      ad_start_date_time: ScheduleTimeValidator.validateAdStartTime,
      booking_start_date_time: ScheduleTimeValidator.validateBookingStartTime,
      start_date: ScheduleTimeValidator.validateEventStartTime,
      end_date: ScheduleTimeValidator.validateEventEndTime,
    };

    const validator = validationMap[field];
    if (validator) {
      validationResult = validator({
        date,
        form,
        timezone: getEventTimezone(),
      });
    }

    // Handle validation failure
    if (!validationResult?.isValid) {
      console.log("Validation Failed:", validationResult);
      message.error(validationResult.message);
      form.setFieldsValue({ [field]: null });
      ScheduleTimeValidator.clearFieldValue(form, [field]);
      return;
    }

    // Handle warning cases
    if (validationResult.isWarning) {
      console.log("Warning detected!");
      Modal.confirm({
        title: "Warning",
        content: validationResult.message,
        okText: "Proceed",
        cancelText: "Cancel",
        onOk() {
          console.log("User confirmed changes");
          form.setFieldsValue({ [field]: date });
          ScheduleTimeValidator.clearFieldValue(
            form,
            validationResult.clearFields || []
          );
          handleReset();
          if (field === "end_date" || field === "start_date") {
            updateDateRange(
              form.getFieldValue("start_date"),
              form.getFieldValue("end_date")
            );
          }
        },
        onCancel() {
          console.log("User canceled changes");
        },
      });
    } else {
      form.setFieldsValue({ [field]: date });
      if (field === "end_date" || field === "start_date") {
        handleReset();
        updateDateRange(
          form.getFieldValue("start_date"),
          form.getFieldValue("end_date")
        );
      }
    }
  };

  return (
    <>
      <Title level={4}>
        Schedule Time Slots{" "}
        <TimezoneClock
          timezone={getEventTimezone()}
          eventDetails={eventDetails}
        />
      </Title>

      <Card>
        <Title level={5}>Event Time</Title>
        <Row gutter={[24]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="ad_start_date_time"
              label="Ad Start Time"
              rules={[{ required: true, message: "Ad start time is required" }]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: "HH:mm" }}
                style={{ width: "100%" }}
                onSelect={(date) =>
                  handleScheduleDateChange("ad_start_date_time", date, "select")
                }
                onChange={(date) =>
                  handleScheduleDateChange("ad_start_date_time", date, "change")
                }
                placeholder="Select ad start time"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="booking_start_date_time"
              label="Booking Start Time"
              rules={[{ required: true }]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: "HH:mm" }}
                style={{ width: "100%" }}
                onSelect={(date) =>
                  handleScheduleDateChange(
                    "booking_start_date_time",
                    date,
                    "select"
                  )
                }
                onChange={(date) =>
                  handleScheduleDateChange(
                    "booking_start_date_time",
                    date,
                    "change"
                  )
                }
                placeholder="Select booking start time"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="start_date"
              label="Event Start Date"
              rules={[{ required: true }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                onSelect={(date) =>
                  handleScheduleDateChange("start_date", date, "select")
                }
                onChange={(date) =>
                  handleScheduleDateChange("start_date", date, "change")
                }
                placeholder="Select event start date"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="end_date"
              label="Event End Date"
              rules={[{ required: true }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                onSelect={(date) =>
                  handleScheduleDateChange("end_date", date, "select")
                }
                onChange={(date) =>
                  handleScheduleDateChange("end_date", date, "change")
                }
                placeholder="Select event end date"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      {dates.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space
            style={{
              marginBottom: 16,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Title level={5}>Time Slots</Title>
            <Space>
              <Button onClick={applyAllSlotsToAllDates}>
                Apply All Slots to All Dates
              </Button>
            </Space>
          </Space>

          <div style={{ width: "100%", position: "relative" }}>
            <Button
              icon={<LeftOutlined />}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
              onClick={() => handleScroll("left")}
            />
            <div
              ref={segmentRef}
              style={{
                overflow: "hidden",
                margin: "0 40px",
              }}
            >
              <Segmented
                value={activeTab}
                onChange={(value) => dispatch(setActiveTab(value))}
                options={dates.map(renderTimeDateSegment)}
                style={{
                  padding: "4px",
                  margin: "8px",
                  borderRadius: "6px",
                  display: "flex",
                  minWidth: "min-content",
                }}
              />
            </div>
            <Button
              icon={<RightOutlined />}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
              onClick={() => handleScroll("right")}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            {activeTab && renderTimeDateTimeSlots(activeTab)}
          </div>
        </Card>
      )}
    </>
  );
}
