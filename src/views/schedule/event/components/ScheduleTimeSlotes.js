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
  reSetOffersAndCoupons,
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
   const { availableTicketTyps,selectedTicketType } = useSelector((state) => state.tickets);
  useEffect(() => {
    // const eventId = 7;

    const eventId = form?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, form]);

  const { eventDetails } = useSelector((state) => state.event);
  const { selectedVenue } = useSelector((state) => state.locations);
  const { timeSlots, activeTab, dates, slotStatus } = useSelector(
    (state) => state.schedules
  );
  useEffect(() => {
    const newSlotStatus = {};

    // First, find the latest show_end_date across all slots
    let latestShowEndDate = null;
    Object.entries(timeSlots).forEach(([date, slots]) => {
      const slotsArray = Array.isArray(slots) ? slots : [];
      slotsArray.forEach((slot) => {
        if (
          slot.show_end_date &&
          (!latestShowEndDate ||
            dayjs(slot.show_end_date).isAfter(dayjs(latestShowEndDate)))
        ) {
          latestShowEndDate = slot.show_end_date;
        }
      });
    });

    Object.entries(timeSlots).forEach(([date, slots]) => {
      const slotsArray = Array.isArray(slots) ? slots : [];

      // Check for empty slots array
      if (slotsArray.length === 0) {
        const isDateCovered = Object.entries(timeSlots).some(
          ([prevDate, prevSlots]) => {
            return prevSlots.some(
              (slot) =>
                slot.show_end_date &&
                dayjs(date).isSameOrBefore(dayjs(slot.show_end_date), "day")
            );
          }
        );
        newSlotStatus[date] = isDateCovered ? "green" : "blue";
        return;
      }

      // Check for null or empty required fields in any slot
      const hasNullFields = slotsArray.some((slot) => {
        if (!slot) return true;

        // Check all required fields for null, undefined, or empty string
        const requiredFields = ["start_time"];
        const hasEmptyRequired = requiredFields.some((field) => {
          const value = slot[field];
          return value === null || value === undefined || value === "";
        });

        // Check end-related fields based on midnight passed status
        if (slot.is_midnight_passed) {
          return hasEmptyRequired || !slot.show_end_date;
        } else {
          return hasEmptyRequired || !slot.end_time;
        }
      });

      if (hasNullFields) {
        newSlotStatus[date] = "red";
        return;
      }

      // Check if slots are complete
      const allSlotsComplete = slotsArray.every((slot) => {
        if (!slot || !slot.start_time) return false;
        if (slot.is_midnight_passed) {
          return !!slot.show_end_date;
        }
        return !!slot.end_time;
      });

      // Check for show_end_date coverage
      const isDateCoveredByShowEndDate =
        latestShowEndDate &&
        dayjs(date).isSameOrBefore(dayjs(latestShowEndDate), "day");

      // Check if this date has a midnight passed slot with show_end_date
      const hasOwnMidnightPassedCoverage = slotsArray.some(
        (slot) =>
          slot.is_midnight_passed &&
          slot.show_end_date &&
          dayjs(date).isSameOrBefore(dayjs(slot.show_end_date), "day")
      );

      // Check if covered by previous dates' show_end_date
      const isPreviouslyCovered = Object.entries(timeSlots).some(
        ([prevDate, prevSlots]) => {
          if (dayjs(prevDate).isSame(date) || dayjs(prevDate).isAfter(date))
            return false;

          return prevSlots.some(
            (slot) =>
              slot.show_end_date &&
              dayjs(date).isSameOrBefore(dayjs(slot.show_end_date), "day")
          );
        }
      );

      if (
        isDateCoveredByShowEndDate ||
        hasOwnMidnightPassedCoverage ||
        isPreviouslyCovered
      ) {
        newSlotStatus[date] = "green";
      } else if (allSlotsComplete) {
        newSlotStatus[date] = "green";
      } else {
        newSlotStatus[date] = "red";
      }
    });

    // Handle dates up to and including the latest show_end_date
    if (latestShowEndDate) {
      const lastDate = Object.keys(timeSlots).sort((a, b) =>
        dayjs(b).diff(dayjs(a))
      )[0];

      if (lastDate) {
        let currentDate = dayjs(lastDate);
        const endDate = dayjs(latestShowEndDate);

        while (currentDate.isSameOrBefore(endDate, "day")) {
          const dateStr = currentDate.format("YYYY-MM-DD");
          if (!newSlotStatus[dateStr]) {
            newSlotStatus[dateStr] = "green";
          }
          currentDate = currentDate.add(1, "day");
        }
      }
    }

    dispatch(setSlotStatus(newSlotStatus));
  }, [timeSlots]);
  const applyAllSlotsToAllDates = () => {
    if (!activeTab || !timeSlots[activeTab]) {
      message.warning("Please set up time slots for the current date first");
      return;
    }

    const sourceSlots = timeSlots[activeTab];
    if (!sourceSlots.some((slot) => slot?.start_time)) {
      message.warning("Please set at least one time slot first");
      return;
    }

    // Check if any date has midnight passed slots
    const datesWithMidnightPassed = dates.filter((date) => {
      const slots = timeSlots[date] || [];
      return slots.some((slot) => slot?.is_midnight_passed);
    });

    // If any date has midnight passed slots, show warning and return
    if (datesWithMidnightPassed.length > 0) {
      Modal.warning({
        title: "Cannot Apply Slots",
        content: (
          <div>
            <p>
              Unable to apply slots to all dates because the following dates
              have midnight passed slots:
            </p>
            <p style={{ color: "#ff4d4f" }}>
              {datesWithMidnightPassed.join(", ")}
            </p>
            <p>
              Please clear or modify the midnight passed slots before
              proceeding.
            </p>
          </div>
        ),
      });
      return;
    }

    // Check if any date has incomplete slots
    const datesWithIncompleteSlots = dates.filter((date) => {
      const slots = timeSlots[date] || [];
      return slots.some((slot) => {
        return slot && (!slot.start_time || !slot.end_time);
      });
    });

    // Filter out only valid slots that have start time
    const validSourceSlots = sourceSlots.filter(
      (slot) => slot?.start_time && !slot.is_midnight_passed
    );

    if (validSourceSlots.length === 0) {
      message.warning(
        "No valid slots to apply. Slots with midnight passed cannot be applied to all dates."
      );
      return;
    }

    const confirmDetails = validSourceSlots.map((slot, index) => {
      const startTime = slot.start_time?.format("HH:mm") || "No start time";
      const endTime = slot.end_time?.format("HH:mm") || "No end time";
      const ticketName = getTicketTypeName(slot.ticketType);
      return `Slot ${
        index + 1
      }: ${startTime} - ${endTime}, Ticket: ${ticketName}`;
    });

    // Calculate dates that can be updated
    const updatableDates = dates.filter((date) => date !== activeTab);

    Modal.confirm({
      title: "Confirm Apply to All Dates",
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>This will apply the following slots to all eligible dates:</p>
          <ul>
            {confirmDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
          {datesWithIncompleteSlots.length > 0 && (
            <div style={{ marginTop: "10px", color: "#ff4d4f" }}>
              <p>
                The following dates have incomplete slots that will be
                overwritten: {datesWithIncompleteSlots.join(", ")}
              </p>
            </div>
          )}
          <p>Slots will be applied to {updatableDates.length} dates.</p>
          <p>Are you sure you want to continue?</p>
        </div>
      ),
      okText: "Apply",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const newTimeSlots = { ...timeSlots };
          const formValues = form.getFieldsValue();
          const newFormValues = {
            ...formValues,
            timeSlots: { ...formValues.timeSlots },
          };

          for (const date of updatableDates) {
            const newDateSlots = validSourceSlots.map((sourceSlot) => ({
              start_time: dayjs(date)
                .hour(sourceSlot.start_time.hour())
                .minute(sourceSlot.start_time.minute()),
              end_time: sourceSlot.end_time
                ? dayjs(date)
                    .hour(sourceSlot.end_time.hour())
                    .minute(sourceSlot.end_time.minute())
                : null,
              ticketType: sourceSlot.ticketType,
              seat_structure_id: sourceSlot.seat_structure_id,
              is_midnight_passed: false,
              show_end_date: null,
            }));

            const validation = validateTimeConflicts(newDateSlots);
            if (!validation.valid) {
              throw new Error(`Conflict on ${date}: ${validation.message}`);
            }

            newTimeSlots[date] = newDateSlots;
            newFormValues.timeSlots[date] = newDateSlots;
          }

          dispatch(setTimeSlots(newTimeSlots));
          form.setFieldsValue(newFormValues);
          message.success("Time slots applied to all dates successfully");
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  };

  const applySlotToAllDates = (sourceDate, slotIndex) => {
    // Initial validation
    if (!sourceDate || !timeSlots[sourceDate]) {
      message.warning("Please set up time slots for the current date first");
      return;
    }

    const sourceSlot = timeSlots[sourceDate][slotIndex];
    if (!sourceSlot?.start_time) {
      message.warning("Please set a start time for the slot first");
      return;
    }

    if (!sourceSlot?.end_time && !sourceSlot?.show_end_date) {
      message.warning("Please set an end time for the slot first");
      return;
    }

    if (selectedTicketType === 1) {
      if (!sourceSlot?.seat_structure_id) {
        message.warning("Please select a Seat Structure first");
        return;
      }
    } else {
      if (!sourceSlot?.ticketType) {
        message.warning("Please select a ticket type first");
        return;
      }
    }
    if (sourceSlot.is_midnight_passed) {
      message.warning(
        "Slots with midnight passed cannot be applied to other dates"
      );
      return;
    }

    const startTimeStr = sourceSlot.start_time.format("HH:mm");
    const endTimeStr = sourceSlot.end_time
      ? sourceSlot.end_time.format("HH:mm")
      : "Next day";
    const ticketName = getTicketTypeName(sourceSlot.ticketType);

    Modal.confirm({
      title: "Confirm Apply to All Dates",
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>This action will apply the following time slot to all dates:</p>
          <ul>
            <li>
              Time: {startTimeStr} - {endTimeStr}
            </li>
            <li>Ticket Type: {ticketName}</li>
          </ul>
          <p>
            This will overwrite any existing slots in the same position on other
            dates.
          </p>
          <p>Are you sure you want to continue?</p>
        </div>
      ),
      okText: "Apply",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const newTimeSlots = { ...timeSlots };
          const formValues = form.getFieldsValue();
          const newFormValues = {
            ...formValues,
            timeSlots: { ...formValues.timeSlots },
          };

          for (const date of dates) {
            if (date === sourceDate) continue;

            // Create new arrays for each date
            if (!newTimeSlots[date]) {
              newTimeSlots[date] = [];
            }
            if (!newFormValues.timeSlots[date]) {
              newFormValues.timeSlots[date] = [];
            }

            // Create new slot arrays with the correct length
            const newDateSlots = [...Array(slotIndex + 1)].map((_, idx) => {
              if (idx === slotIndex) {
                return {
                  start_time: dayjs(date)
                    .hour(sourceSlot.start_time.hour())
                    .minute(sourceSlot.start_time.minute()),
                  end_time: sourceSlot.end_time
                    ? dayjs(date)
                        .hour(sourceSlot.end_time.hour())
                        .minute(sourceSlot.end_time.minute())
                    : null,
                  ticketType: sourceSlot.ticketType,
                  seat_structure_id: sourceSlot.seat_structure_id,
                  is_midnight_passed: false,
                  show_end_date: null,
                };
              }
              return (
                newTimeSlots[date][idx] || {
                  start_time: null,
                  end_time: null,
                  ticketType: null,
                  seat_structure_id:null,
                  is_midnight_passed: false,
                  show_end_date: null,
                }
              );
            });

            // Validate and assign new arrays
            const validation = validateTimeConflicts(newDateSlots);
            if (!validation.valid) {
              throw new Error(`Conflict on ${date}: ${validation.message}`);
            }

            newTimeSlots[date] = newDateSlots;
            newFormValues.timeSlots[date] = newDateSlots;
          }

          // Update state and form
          dispatch(setTimeSlots(newTimeSlots));
          form.setFieldsValue(newFormValues);
          message.success("Time slot applied to all dates successfully");
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  };
  // Updated validation function for better error handling
  const validateTimeConflicts = (slots) => {
    if (!Array.isArray(slots) || slots.length === 0) {
      return { valid: true };
    }

    // Filter out invalid slots and sort by start time
    const validSlots = slots
      .filter((slot) => slot && slot.start_time && slot.end_time)
      .sort((a, b) => a.start_time.valueOf() - b.start_time.valueOf());

    // Check for overlapping slots
    for (let i = 0; i < validSlots.length - 1; i++) {
      const currentSlot = validSlots[i];
      const nextSlot = validSlots[i + 1];

      // Ensure both slots have end times
      if (!currentSlot.end_time || !nextSlot.start_time) {
        return {
          valid: false,
          message: "All slots must have both start and end times",
        };
      }

      // Check for overlap
      if (
        currentSlot.end_time.isAfter(nextSlot.start_time) ||
        currentSlot.end_time.isSame(nextSlot.start_time)
      ) {
        return {
          valid: false,
          message: `Time conflict between slots: ${currentSlot.start_time.format(
            "HH:mm"
          )} - ${currentSlot.end_time.format(
            "HH:mm"
          )} and ${nextSlot.start_time.format(
            "HH:mm"
          )} - ${nextSlot.end_time.format("HH:mm")}`,
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

    dispatch(reSetOffersAndCoupons());
    dispatch(setDates(newDates));
    dispatch(setActiveTab(newDates[0]));

    // Initialize time slots for new dates with array
    const initialTimeSlots = {};
    newDates.forEach((date) => {
      // Ensure we always have an array, even if empty
      initialTimeSlots[date] = Array.isArray(timeSlots[date])
        ? timeSlots[date]
        : [
            /* {
              start_time: null,
              end_time: null,
              is_midnight_passed: false,
              show_end_date: null,
            }, */
          ];
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
    // Create new arrays instead of modifying existing ones
    const currentSlots = timeSlots[dateStr] ? [...timeSlots[dateStr]] : [];
    const newSlots = currentSlots.filter((_, idx) => idx !== index);

    // Update form values
    const formValues = form.getFieldsValue();
    const newFormValues = {
      ...formValues,
      timeSlots: {
        ...formValues.timeSlots,
        [dateStr]: newSlots,
      },
    };
    form.setFieldsValue(newFormValues);

    // Update Redux state
    const newTimeSlots = {
      ...timeSlots,
      [dateStr]: newSlots,
    };
    dispatch(setTimeSlots(newTimeSlots));
  };

  // const handleRemoveTimeSlot = (dateStr, index) => {
  //   dispatch(removeExistingTimeSlot({ dateStr, index }));
  // };

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
    if (!eventDetails?.venue_ticket_structures) return [];

    // Find the venue ticket structure for the selected venue
    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );

    if (!venueTicketStructure) return [];

    // Map the ticket structures to the required format
    return venueTicketStructure.ticket_structures.map((structure) => ({
      value: structure.ticket_structure,
      label: structure.ticket_structure_name,
      children: structure.ticket_sets.map((set) => ({
        value: set,
        label: set,
      })),
    }));
  }, [eventDetails, selectedVenue]);
  const availableSeats = () => {
    // Check if event_venue_seat_structure exists
    if (!eventDetails?.event_venue_seat_structure) return [];

    // If no venue is selected, return empty array
    if (selectedVenue === undefined || selectedVenue === null) return [];

    // Find the venue seat structure for the selected venue using venue_id
    const venueSeatStructure = eventDetails.event_venue_seat_structure.find(
      (vts) => vts.venue_id === selectedVenue
    );

    // If no venue seat structure found or no event_seats, return empty array
    if (!venueSeatStructure || !venueSeatStructure.event_seats) return [];

    // Return the event_seats for the selected venue
    return venueSeatStructure.event_seats;
  };

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
        eventDetails={eventDetails}
        availableSeats={availableSeats()}
      />
    );
  };

  const getEventTimezone = () => {
    return (
      eventDetails?.venue_events?.[0]?.venue?.place?.country?.time_zone ||
      "America/New_York"
    );
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
          countyName={
            eventDetails?.venue_events?.[0]?.venue?.place?.country?.name
          }
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
                showNow={false}
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
                showNow={false}
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
