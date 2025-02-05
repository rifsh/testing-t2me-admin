import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Form,
  DatePicker,
  TimePicker,
  Button,
  Typography,
  Row,
  Col,
  Space,
  message,
  Badge,
  Segmented,
  Cascader,
  Select,
  Modal,
} from "antd";
import {
  CopyOutlined,
  MinusCircleOutlined,
  PlusOutlined,
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
import { fetchAllTickets } from "store/slices/ticketSlice";
import { fetchEventDetails } from "store/slices/eventSlice";
import { labels } from "views/app-views/apps/mail/MailLabels";

const { Title } = Typography;

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export function ScheduleTimeSlots({ form }) {
  const [timeSlots, setTimeSlots] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [dates, setDates] = useState([]);
  const [slotStatus, setSlotStatus] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const segmentRef = useRef(null);

  const timeZone = dayjs.tz.guess();
  const currentDateInTimeZone = useMemo(() => dayjs().tz(timeZone), [timeZone]);
  const dispatch = useDispatch();

  const { filteredTickets } = useSelector((state) => state.tickets);
  const { selectedVenue } = useSelector((state) => state.locations);
  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  useEffect(() => {
    const eventId = form?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, form]);

  useEffect(() => {
    const newSlotStatus = {};
    Object.entries(timeSlots).forEach(([date, slots]) => {
      if (!slots || slots.length === 0) {
        newSlotStatus[date] = "yellow";
        return;
      }

      const hasCompleteSlot = slots.some(
        (slot) => slot.start && slot.ticketType && slot.capacity && slot.price
      );

      if (hasCompleteSlot) {
        newSlotStatus[date] = "green";
      } else if (slots.some((slot) => slot.start)) {
        newSlotStatus[date] = "green";
      } else {
        newSlotStatus[date] = "red";
      }
    });
    setSlotStatus(newSlotStatus);
  }, [timeSlots]);

  const validateTimeConflicts = (slots) => {
    if (!slots || slots.length === 0) return { valid: true };

    const sortedSlots = [...slots]
      .filter((slot) => slot.start)
      .sort((a, b) => a.start.valueOf() - b.start.valueOf());

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = sortedSlots[i];
      const nextSlot = sortedSlots[i + 1];

      if (
        currentSlot.end &&
        nextSlot.start &&
        currentSlot.end.isAfter(nextSlot.start)
      ) {
        return {
          valid: false,
          message: `Time conflict between slots: ${currentSlot.start.format(
            "HH:mm"
          )} - ${currentSlot.end.format("HH:mm")} and ${nextSlot.start.format(
            "HH:mm"
          )} - ${nextSlot.end?.format("HH:mm")}`,
        };
      }
    }

    return { valid: true };
  };
  const updateDateRange = (startDate, endDate) => {
    if (!validateDateRange(startDate, endDate)) return;

    const newDates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isSameOrBefore(end, "day")) {
      newDates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    setDates(newDates);
    setActiveTab(newDates[0]);

    // Initialize time slots for new dates
    const initialTimeSlots = {};
    newDates.forEach((date) => {
      initialTimeSlots[date] = timeSlots[date] || [{ start: null, end: null }];
    });
    setTimeSlots(initialTimeSlots);
  };

  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;

    if (endDate.isSameOrBefore(startDate)) {
      message.error("End date must be after start date");
      return false;
    }

    if (startDate.isBefore(currentDateInTimeZone, "day")) {
      message.error("Start date cannot be in the past");
      return false;
    }

    const daysDiff = endDate.diff(startDate, "days");
    if (daysDiff > 30) {
      message.error("Date range cannot exceed 30 days");
      return false;
    }

    return true;
  };

  const addTimeSlot = (dateStr) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), { start: null, end: null }],
    }));
  };

  const removeTimeSlot = (dateStr, index) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((_, i) => i !== index),
    }));
  };


  const validateTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return { valid: true };

    const sortedSlots = [...slots]
      .filter((slot) => slot.start)
      .sort((a, b) => a.start?.valueOf() - b.start?.valueOf());

    for (let i = 0; i < sortedSlots.length; i++) {
      const { start, end } = sortedSlots[i];

      if (start && end && end.isSameOrBefore(start)) {
        return { valid: false, message: "End time must be after start time" };
      }

      if (i < sortedSlots.length - 1) {
        const nextSlot = sortedSlots[i + 1];
        if (end && nextSlot.start && end.isAfter(nextSlot.start)) {
          return { valid: false, message: "Time slots cannot overlap" };
        }
      }
    }

    return { valid: true };
  };

  const applySlotToAllDates = (sourceDate, slotIndex) => {
    if (!sourceDate || !timeSlots[sourceDate]) {
      message.warning("Please set up time slots for the current date first");
      return;
    }

    const sourceSlot = timeSlots[sourceDate][slotIndex];
    if (!sourceSlot.start) {
      message.warning("Please set a start time for the slot first");
      return;
    }

    const confirmDetails = [
      `Apply time slot ${sourceSlot.start.format("HH:mm")} - ${
        sourceSlot.end?.format("HH:mm") || "No end time"
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

            const targetStart = sourceSlot.start
              ? dayjs(date)
                  .hour(sourceSlot.start.hour())
                  .minute(sourceSlot.start.minute())
              : null;

            const targetEnd = sourceSlot.end
              ? dayjs(date)
                  .hour(sourceSlot.end.hour())
                  .minute(sourceSlot.end.minute())
              : null;

            // Ensure slot exists
            while (updatedSlots.length <= slotIndex) {
              updatedSlots.push({ start: null, end: null });
            }

            updatedSlots[slotIndex] = {
              ...sourceSlot,
              start: targetStart,
              end: targetEnd,
            };

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
              start: targetStart,
              end: targetEnd,
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

        setTimeSlots(newTimeSlots);
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
    if (!sourceSlots.some((slot) => slot.start)) {
      message.warning("Please set at least one time slot first");
      return;
    }

    const confirmDetails = sourceSlots
      .filter((slot) => slot.start)
      .map(
        (slot) =>
          `Time: ${slot.start.format("HH:mm")} - ${
            slot.end?.format("HH:mm") || "No end time"
          }, ` + `Ticket: ${getTicketTypeName(slot.ticketType)}`
      );

    confirmDetails.push("This will overwrite all existing slots on other dates");

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
              const targetStart = slot.start
                ? dayjs(date)
                    .hour(slot.start.hour())
                    .minute(slot.start.minute())
                : null;

              const targetEnd = slot.end
                ? dayjs(date)
                    .hour(slot.end.hour())
                    .minute(slot.end.minute())
                : null;

              return {
                ...slot,
                start: targetStart,
                end: targetEnd,
              };
            });

            // Update form values
            if (!newFormValues.timeSlots) {
              newFormValues.timeSlots = {};
            }
            newFormValues.timeSlots[date] = updatedSlots.map((slot) => ({
              start: slot.start,
              end: slot.end,
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

        setTimeSlots(newTimeSlots);
        form.setFieldsValue(newFormValues);
        message.success("All time slots applied to all dates successfully");
      },
    });
  };

  const handleTimeChange = (dateStr, index, type, value) => {
    setTimeSlots((prev) => {
      const newTimeSlots = {
        ...prev,
        [dateStr]: prev[dateStr].map((slot, i) =>
          i === index ? { ...slot, [type]: value } : slot
        ),
      };
      return newTimeSlots;
    });

    // Update form values
    const currentFormValues = form.getFieldsValue();
    if (!currentFormValues.timeSlots) {
      currentFormValues.timeSlots = {};
    }
    if (!currentFormValues.timeSlots[dateStr]) {
      currentFormValues.timeSlots[dateStr] = [];
    }
    while (currentFormValues.timeSlots[dateStr].length <= index) {
      currentFormValues.timeSlots[dateStr].push({});
    }
    currentFormValues.timeSlots[dateStr][index] = {
      ...currentFormValues.timeSlots[dateStr][index],
      [type]: value,
    };
    form.setFieldsValue(currentFormValues);
  };
  const getTicketTypeName = (ticketTypeId) => {
    return (
      eventDetails?.event_ticket_structures?.find((t) => t.id === ticketTypeId)
        ?.ticket_structure?.name || "Not selected"
    );
  };
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formattedData = {
        event_times: {
          start_date: values.start_date.format(),
          end_date: values.end_date.format(),
          adv_start_time: values.adv_start_time?.format(),
          booking_start_time: values.booking_start_time.format(),
        },
        time_slots: Object.entries(timeSlots).map(([date, slots]) => ({
          date,
          slots: slots
            .filter((slot) => slot.start)
            .map((slot) => ({
              start_time: slot.start.format("HH:mm"),
              end_time: slot.end?.format("HH:mm"),
              ticket_type: slot.ticketType,
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

  const renderDateSegment = (dateStr) => ({
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

  const renderTimeSlots = (dateStr) => (
    <div style={{ marginTop: 16 }}>
      {timeSlots[dateStr]?.map((slot, index) => (
        <Row
          key={index}
          gutter={[16, 16]}
          align="middle"
          style={{ marginBottom: 16 }}
        >
          {/* Start Time */}
          <Col span={6}>
            <Form.Item
              name={["timeSlots", dateStr, index, "start"]}
              label="Start Time"
              rules={[
                {
                  required: true,
                  message: "Please select booking start time",
                },
              ]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.start}
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "start", time)
                }
                style={{ width: "100%" }}
                placeholder="Start Time"
              />
            </Form.Item>
          </Col>

          {/* End Time (Optional) */}
          <Col span={6}>
            <Form.Item
              label="End Time"
              name={["timeSlots", dateStr, index, "end"]}
            >
              <TimePicker
                format="HH:mm"
                value={slot.end}
                onChange={(time) =>
                  handleTimeChange(dateStr, index, "end", time)
                }
                style={{ width: "100%" }}
                placeholder="End Time"
              />
            </Form.Item>
          </Col>

          {/* Ticket Type Selection */}
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
              />
            </Form.Item>
          </Col>

          {/* Action Buttons */}
          <Col span={4} style={{ marginTop: "45px" }}>
            <Space>
              <Button
                type="default"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => removeTimeSlot(dateStr, index)}
              />
              <Button
                type="default"
                icon={<CopyOutlined />}
                onClick={() => applySlotToAllDates(dateStr, index)}
                title="Apply this slot to all dates"
              />
            </Space>
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
    </div>
  );

  return (
    <Form form={form} layout="vertical">
      <Title level={4}>Schedule Time Slots</Title>

      <Card>
        <Title level={5}>Event Time</Title>
        <Row gutter={[24]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="adv_start_time"
              label="Ad Start Time"
              rules={[
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const startDate = form.getFieldValue("start_date");
                    if (value.isAfter(startDate)) {
                      return Promise.reject(
                        new Error("Ad start must be before event start")
                      );
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
                      return Promise.reject(
                        new Error("Booking start must be before event start")
                      );
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
                      return Promise.reject(
                        new Error("Start time cannot be in the past")
                      );
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
                      return Promise.reject(
                        new Error("Please select start time first")
                      );
                    }
                    if (value.isSameOrBefore(startDate)) {
                      return Promise.reject(
                        new Error("End time must be after start time")
                      );
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
                onChange={setActiveTab}
                options={dates.map(renderDateSegment)}
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
            {activeTab && renderTimeSlots(activeTab)}
          </div>
        </Card>
      )}

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col>
          <Button type="primary" onClick={handleSubmit}>
            Save Schedule
          </Button>
        </Col>
        <Col>
          <Button onClick={handleReset}>Reset</Button>
        </Col>
      </Row>
    </Form>
  );
}
