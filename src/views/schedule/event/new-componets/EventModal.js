import React, { useState, useEffect, useRef } from "react";
import { Alert, Button, message, Switch } from "antd";
import {
  Clock,
  Calendar,
  Users,
  Trash2,
  X,
  AlertTriangle,
  Ticket,
  Settings,
  Lock,
  Move,
  Moon,
  BadgePercent,
  Tag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetails } from "store/slices/eventSlice";
import { ScheduleUtil } from "../utils";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";
import CustomSelect from "./CustomSelect";
import dayjs from "dayjs";
import { RiCoupon2Line } from "react-icons/ri";
import { LocalOfferOutlined } from "@mui/icons-material";

const EventModal = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  onApplyToAll,
  allDays,
  existingEvents,
  form: parentForm,
  eventDateRange,
  isBlocked,
}) => {
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [showMultiDayWarning, setShowMultiDayWarning] = useState(false);
  const [dateValidationError, setDateValidationError] = useState(null);
  const availableTypes = parentForm?.getFieldValue("available_types");
  const isSeatBased = availableTypes === "seat_structure";

  // Enhanced dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const modalRef = useRef(null);

  // Form data structure with manual midnight toggle
  const [formData, setFormData] = useState({
    start_date: null,
    start_time: "09:00",
    end_time: "10:00",
    show_end_date: null,
    is_midnight_passed: false,
    ticket_structure_id: null,
    ticket_set: null,
    seat_structure_id: null,
    offer_ids: null,
    coupon_ids: null,
  });

  const dispatch = useDispatch();
  const { selectedTicketType } = useSelector((state) => state.tickets || {});
  const { eventDetails, selectedEvent } = useSelector(
    (state) => state.event || {}
  );
  const { selectedVenue } = useSelector((state) => state.locations || {});

  // Enhanced dragging handlers (same as before)
  const handleMouseDown = (e) => {
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - 900;
      const maxY = window.innerHeight - 400;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const eventId = parentForm?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, parentForm]);

  // Enhanced ticket options (same as before)
  const ticketOptions = React.useMemo(() => {
    if (!eventDetails?.venue_ticket_structures) return [];
    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );
    if (!venueTicketStructure) return [];
    return venueTicketStructure.ticket_structures.map((structure) => ({
      value: structure.ticket_structure,
      label: structure.ticket_structure_name,
    }));
  }, [eventDetails, selectedVenue]);

  const ticketSetOptions = React.useMemo(() => {
    if (!eventDetails?.venue_ticket_structures || !formData.ticket_structure_id)
      return [];
    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );
    if (!venueTicketStructure) return [];
    const selectedTicketStructure = venueTicketStructure.ticket_structures.find(
      (structure) => structure.ticket_structure === formData.ticket_structure_id
    );
    if (!selectedTicketStructure?.ticket_sets) return [];
    return selectedTicketStructure.ticket_sets.map((set) => ({
      value: set.id || set,
      label: set.name || `Ticket Set ${set}`,
    }));
  }, [eventDetails, selectedVenue, formData.ticket_structure_id]);

  const availableSeats = React.useMemo(() => {
    if (!eventDetails?.event_venue_seat_structure) return [];
    if (selectedVenue === undefined || selectedVenue === null) return [];
    const venueSeatStructure = eventDetails.event_venue_seat_structure.find(
      (vts) => vts.venue_id === selectedVenue
    );
    if (!venueSeatStructure || !venueSeatStructure.event_seats) return [];
    return venueSeatStructure.event_seats.map((seat) => ({
      value: seat.id,
      label: seat.seat_structure_name || `Seat Structure ${seat.id}`,
    }));
  }, [eventDetails, selectedVenue]);

  const availableOffers = React.useMemo(() => {
    if (!eventDetails?.offers) return [];
    return eventDetails.offers.map((offer) => ({
      value: offer.id,
      label: `${offer.name}`,
    }));
  }, [eventDetails]);

  const availableCoupons = React.useMemo(() => {
    if (!eventDetails?.coupons) return [];
    return eventDetails.coupons.map((coupon) => ({
      value: coupon.id,
      label: `${coupon.name}`,
    }));
  }, [eventDetails]);

  // FIXED: Enhanced date validation function with proper midnight logic
  const validateDates = (data) => {
    setDateValidationError(null);

    if (!data.start_date) {
      return true; // Skip validation if no start date
    }

    // Get event date range (from parent component or form)
    const eventStartDate =
      eventDateRange?.startDate || parentForm?.getFieldValue("start_date");
    const eventEndDate =
      eventDateRange?.endDate || parentForm?.getFieldValue("end_date");

    if (!eventStartDate || !eventEndDate) {
      return true; // Skip validation if event dates not available
    }

    const startDate = new Date(eventStartDate);
    const endDate = new Date(eventEndDate);
    const selectedStartDate = new Date(data.start_date);

    // Set time to compare dates only
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    selectedStartDate.setHours(0, 0, 0, 0);

    // FIXED: Log date validation for debugging
    console.log("📅 DATE VALIDATION:", {
      eventStartDate: startDate.toISOString(),
      eventEndDate: endDate.toISOString(),
      selectedStartDate: selectedStartDate.toISOString(),
      isMidnight: data.is_midnight_passed,
      showEndDate: data.show_end_date
        ? new Date(data.show_end_date).toISOString()
        : null,
    });

    // Validate start date is within event range
    if (selectedStartDate < startDate || selectedStartDate > endDate) {
      setDateValidationError("Start date must be within the event date range");
      return false;
    }

    // FIXED: Enhanced midnight passed end date validation
    if (data.is_midnight_passed && data.show_end_date) {
      const selectedEndDate = new Date(data.show_end_date);
      selectedEndDate.setHours(0, 0, 0, 0);

      console.log("🌙 MIDNIGHT VALIDATION:", {
        selectedEndDate: selectedEndDate.toISOString(),
        eventStartDate: startDate.toISOString(),
        eventEndDate: endDate.toISOString(),
        isWithinRange:
          selectedEndDate >= startDate && selectedEndDate <= endDate,
      });

      // FIXED: Must be within event date range
      if (selectedEndDate < startDate || selectedEndDate > endDate) {
        setDateValidationError(
          "Show end date must be within the event date range"
        );
        return false;
      }

      // FIXED: For midnight events, end date can be same as start date or later
      if (selectedEndDate < selectedStartDate) {
        setDateValidationError("Show end date cannot be before the start date");
        return false;
      }

      // FIXED: Reasonable limit for midnight events (max 7 days)
      const daysDifference =
        (selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24);
      if (daysDifference > 7) {
        setDateValidationError(
          "Show end date should not be more than 7 days after start date"
        );
        return false;
      }
    }

    return true;
  };

  // FIXED: Get min/max dates for date pickers with proper boundaries
  const getDateLimits = () => {
    const eventStartDate =
      eventDateRange?.startDate || parentForm?.getFieldValue("start_date");
    const eventEndDate =
      eventDateRange?.endDate || parentForm?.getFieldValue("end_date");

    let minDate = null;
    let maxDate = null;

    if (eventStartDate && eventEndDate) {
      minDate = new Date(eventStartDate);
      maxDate = new Date(eventEndDate);

      // Set proper times
      minDate.setHours(0, 0, 0, 0);
      maxDate.setHours(23, 59, 59, 999);
    }

    return { minDate, maxDate };
  };

  // FIXED: Get proper min/max dates for show_end_date
  const getShowEndDateLimits = () => {
    const { minDate, maxDate } = getDateLimits();

    let showEndMinDate = null;
    let showEndMaxDate = maxDate; // Same as event end date

    if (formData.start_date) {
      // FIXED: Min date for show_end_date should be start_date (same day allowed for midnight)
      showEndMinDate = new Date(formData.start_date);
      showEndMinDate.setHours(0, 0, 0, 0);
    } else if (minDate) {
      showEndMinDate = minDate;
    }

    return { showEndMinDate, showEndMaxDate };
  };

  // Simplified multi-day warning check (same as before)
  useEffect(() => {
    if (isOpen && event) {
      const isActualMultiDay =
        (event.originalStartDay !== undefined &&
          event.originalEndDay !== undefined &&
          event.originalStartDay !== event.originalEndDay &&
          !event.is_midnight_passed) ||
        (event.startTime?.day !== event.endTime?.day &&
          !event.is_midnight_passed);

      if (isActualMultiDay) {
        setShowMultiDayWarning(true);
        return;
      }
    }
  }, [isOpen, event]);

  useEffect(() => {
    if (isOpen && !showMultiDayWarning) {
      if (event) {
        let start_date = null;

        if (allDays && allDays.length > 0) {
          const startDayIndex =
            event.originalStartDay !== undefined
              ? event.originalStartDay
              : event.startTime?.day || 0;

          if (startDayIndex >= 0 && startDayIndex < allDays.length) {
            start_date = allDays[startDayIndex];
          }
        }

        const startHour = event.startTime?.hour || 9;
        const endHour = event.endTime?.hour || 10;

        setFormData({
          start_date,
          start_time: `${startHour.toString().padStart(2, "0")}:${(
            event.startTime?.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          end_time: `${endHour.toString().padStart(2, "0")}:${(
            event.endTime?.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          show_end_date: event.show_end_date
            ? new Date(event.show_end_date)
            : null,
          is_midnight_passed: event.is_midnight_passed || false,
          // ✅ FIX: Handle both ticket and seat fields properly
          ticket_structure_id:
            event.ticket_structure_id || event.ticketType || null,
          ticket_set: event.ticket_set || event.ticketSet || null,
          seat_structure_id:
            event.seat_structure_id || event.seatStructureId || null,
          offer_ids: Array.isArray(event.offer_ids)
            ? event.offer_ids
            : event.offer_ids
            ? [event.offer_ids]
            : [],
          coupon_ids: Array.isArray(event.coupon_ids)
            ? event.coupon_ids
            : event.coupon_ids
            ? [event.coupon_ids]
            : [],
        });
      } else {
        const defaultDate =
          allDays && allDays.length > 0 ? allDays[0] : new Date();
        setFormData({
          start_date: defaultDate,
          start_time: "09:00",
          end_time: "10:00",
          show_end_date: null,
          is_midnight_passed: false,
          ticket_structure_id: null,
          ticket_set: null,
          seat_structure_id: null,
          offer_ids: [],
          coupon_ids: [],
        });
      }
    }
  }, [isOpen, event, allDays, showMultiDayWarning]);

  // FIXED: Update form data function with proper validation
  // FIXED: Update form data function with proper validation
  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "ticket_structure_id") {
        updated.ticket_set = null;
      }

      if (field === "is_midnight_passed" && !value) {
        updated.show_end_date = null;
      }

      // FIXED: For midnight events, suggest NEXT DAY as start date for show_end_date
      if (
        field === "is_midnight_passed" &&
        value &&
        !updated.show_end_date &&
        updated.start_date
      ) {
        // FIXED: Set show_end_date to NEXT DAY (not same day)
        const nextDay = new Date(updated.start_date);
        nextDay.setDate(nextDay.getDate() + 1);
        updated.show_end_date = nextDay;
      }

      // FIXED: When start_date changes and midnight is enabled, update show_end_date to NEXT DAY
      if (field === "start_date" && value && updated.is_midnight_passed) {
        // FIXED: Update to NEXT day (not same day)
        const nextDay = new Date(value);
        nextDay.setDate(nextDay.getDate() + 1);
        updated.show_end_date = nextDay;
      }

      return updated;
    });

    const updatedData = { ...formData, [field]: value };

    // Run date validation
    validateDates(updatedData);
    checkConflicts(updatedData);
  };

  // Conflict checking (same as before but with date validation)
  const checkConflicts = (data) => {
    if (!data.start_date || !data.start_time || !data.end_time || !allDays) {
      setConflictWarning(null);
      return;
    }

    const startDayIndex = allDays.findIndex(
      (day) => day.toDateString() === data.start_date.toDateString()
    );

    if (startDayIndex === -1) {
      setConflictWarning("Selected date is outside the current range");
      return;
    }

    const [startHour, startMinute] = data.start_time.split(":").map(Number);
    const [endHour, endMinute] = data.end_time.split(":").map(Number);

    let endDayIndex = startDayIndex;
    if (data.is_midnight_passed) {
      // FIXED: For midnight events, end day should be calculated properly
      if (data.show_end_date) {
        const endDayIndexFound = allDays.findIndex(
          (day) => day.toDateString() === data.show_end_date.toDateString()
        );
        endDayIndex =
          endDayIndexFound !== -1 ? endDayIndexFound : startDayIndex;
      } else {
        endDayIndex = startDayIndex;
      }
    }

    const testEvent = {
      id: event?.id || "test",
      startTime: { day: startDayIndex, hour: startHour, minute: startMinute },
      endTime: { day: endDayIndex, hour: endHour, minute: endMinute },
      is_midnight_passed: data.is_midnight_passed,
    };

    const conflicts = ScheduleUtil.findConflictingEvents(
      testEvent,
      existingEvents,
      event?.id
    );

    if (conflicts.length > 0) {
      setConflictWarning(`Conflicts with ${conflicts.length} existing slot(s)`);
    } else {
      setConflictWarning(null);
    }
  };

  // Enhanced form validation with date validation
  const isFormValid = () => {
    const requiredFields = ["start_date", "start_time", "end_time"];

    if (dateValidationError) {
      return false;
    }

    if (formData.is_midnight_passed && !formData.show_end_date) {
      return false;
    }

    // ✅ FIX: Check based on actual available_types
    if (isSeatBased) {
      requiredFields.push("seat_structure_id");
    } else {
      requiredFields.push("ticket_set", "ticket_structure_id");
    }

    return requiredFields.every(
      (field) =>
        formData[field] !== null &&
        formData[field] !== undefined &&
        formData[field] !== ""
    );
  };

  // FIXED: Enhanced save handler with proper midnight logic
  const handleSave = async () => {
    try {
      setLoading(true);

      if (!formData.start_date || !formData.start_time || !formData.end_time) {
        message.error("Please fill in all required time fields");
        return;
      }

      if (!validateDates(formData)) {
        message.error(
          dateValidationError || "Please check your date selection"
        );
        return;
      }

      if (formData.is_midnight_passed && !formData.show_end_date) {
        message.error("Please select show end date for midnight passed events");
        return;
      }
      if (isSeatBased) {
        if (!formData.seat_structure_id) {
          message.error("Please select a seat structure");
          return;
        }
      } else {
        if (!formData.ticket_structure_id) {
          message.error("Please select a ticket type");
          return;
        }
        if (!formData.ticket_set) {
          message.error("Please select a ticket set");
          return;
        }
      }

      if (conflictWarning) {
        message.error("Please resolve conflicts before saving");
        return;
      }

      const startDayIndex = allDays.findIndex(
        (day) => day.toDateString() === formData.start_date.toDateString()
      );

      if (startDayIndex === -1) {
        message.error("Selected date is outside the current range");
        return;
      }

      const [startHour, startMinute] = formData.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = formData.end_time.split(":").map(Number);

      let endDayIndex = startDayIndex;
      let showEndDate = null;

      // FIXED: In EventModal's handleSave function, ensure proper date formatting
      if (formData.is_midnight_passed) {
        if (formData.show_end_date) {
          // FIXED: Ensure show_end_date is properly formatted and AFTER start_date
          const startDateStr = dayjs(formData.start_date).format("YYYY-MM-DD");
          const endDateStr = dayjs(formData.show_end_date).format("YYYY-MM-DD");

          // If same day, force to next day
          if (endDateStr === startDateStr) {
            const nextDay = dayjs(formData.start_date).add(1, "day");
            showEndDate = nextDay.format("YYYY-MM-DD");
            console.log("🚨 CORRECTED show_end_date to next day:", showEndDate);
          } else {
            showEndDate = endDateStr;
          }

          // Calculate proper end day index for midnight events
          const endDayIndexFound = allDays.findIndex(
            (day) => day.toDateString() === new Date(showEndDate).toDateString()
          );
          endDayIndex =
            endDayIndexFound !== -1 ? endDayIndexFound : startDayIndex + 1;
        } else {
          // FIXED: Default to NEXT day if no show_end_date specified
          const nextDay = dayjs(formData.start_date).add(1, "day");
          showEndDate = nextDay.format("YYYY-MM-DD");
          endDayIndex = startDayIndex + 1;
        }
      }

      const validFromDate = dayjs(formData.start_date).format("YYYY-MM-DD");

      // FIXED: Determine valid_to based on midnight passed
      const validToDate =
        formData.is_midnight_passed && showEndDate
          ? showEndDate
          : validFromDate; // Same date if not midnight passed

      // FIXED: Build offer_ids array with proper structure
      const formattedOfferIds = formData.offer_ids.map((offerId) => ({
        offer_id: offerId,
        valid_from: validFromDate,
        valid_to: validToDate,
      }));

      // FIXED: Build coupon_ids array with proper structure
      const formattedCouponIds = formData.coupon_ids.map((couponId) => ({
        coupon_id: couponId,
        valid_from: validFromDate,
        valid_to: validToDate,
      }));

      const eventData = {
        id: event?.id || `temp-${Date.now()}`,
        type: "timeslot",
        is_midnight_passed: formData.is_midnight_passed,
        show_end_date: showEndDate,
        startTime: { day: startDayIndex, hour: startHour, minute: startMinute },
        endTime: { day: endDayIndex, hour: endHour, minute: endMinute },
        originalStartDay: startDayIndex,
        originalEndDay: endDayIndex,
        ticket_structure_id: formData.ticket_structure_id,
        ticket_set: formData.ticket_set,
        seat_structure_id: formData.seat_structure_id,
        ad_start_date_time: parentForm?.getFieldValue("ad_start_date_time"),
        booking_start_date_time: parentForm?.getFieldValue(
          "booking_start_date_time"
        ),
        event_id: parentForm?.getFieldValue("event_id"),
        venue_id: parentForm?.getFieldValue("venue_id"),
        max_ticket_per_booking: parentForm?.getFieldValue(
          "max_ticket_per_booking"
        ),
        booking_limit_per_user: parentForm?.getFieldValue(
          "booking_limit_per_user"
        ),
        // FIXED: Use formatted arrays with date ranges
        offer_ids: formattedOfferIds,
        coupon_ids: formattedCouponIds,
      };

      onSave(eventData);
      onClose();
      resetPosition();
      message.success("Time slot saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      message.error("Please check your input and try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && event?.id) {
      onDelete(event.id);
      onClose();
      resetPosition();
    }
  };

  const handleMultiDayWarningClose = () => {
    setShowMultiDayWarning(false);
    onClose();
    resetPosition();
  };

  const handleClose = () => {
    onClose();
    resetPosition();
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  if (isBlocked) {
    return (
      <Alert
        message="Time Slot Locked"
        description="Has active bookings"
        type="error"
        showIcon
      />
    );
  }
  // Multi-day warning modal (same as before)
  if (showMultiDayWarning) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleMultiDayWarningClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cannot Edit Multi-day Event
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This is a multi-day event that spans across multiple calendar
              days. Multi-day events cannot be edited directly. Please delete
              and recreate if needed.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleMultiDayWarningClose} className="flex-1">
                Cancel
              </Button>
              <Button danger onClick={handleDelete} className="flex-1">
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDragged = position.x !== 0 || position.y !== 0;
  const { minDate, maxDate } = getDateLimits();
  const { showEndMinDate, showEndMaxDate } = getShowEndDateLimits();

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 z-[999] bg-white/30"
        onClick={handleClose}
      />

      {/* Main Panel - Centered and Wider */}
      <div
        ref={modalRef}
        onMouseDown={handleMouseDown}
        className="fixed bg-white shadow-2xl border"
        style={{
          left: isDragged ? position.x : "50%",
          top: isDragged ? position.y : "50%",
          transform: isDragged ? "none" : "translate(-50%, -50%)",
          minWidth: "1200px",
          maxWidth: "150vw",
          height: "auto",
          zIndex: 1000,
          userSelect: isDragging ? "none" : "auto",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 drag-handle cursor-move flex-shrink-0">
          <div className="flex items-center gap-3">
            <Move size={18} className="text-gray-400" />
            <Clock className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              {event ? "Edit Time Slot" : "Create Time Slot"}
            </h1>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Date & Time Section */}
              <div>
                <div className="space-y-3">
                  <CustomDatePicker
                    label="Start Date"
                    value={formData.start_date}
                    onChange={(value) => updateFormData("start_date", value)}
                    placeholder="Select date"
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CustomTimePicker
                      label="Start Time"
                      value={formData.start_time}
                      onChange={(value) => updateFormData("start_time", value)}
                      placeholder="00:00"
                    />
                    <CustomTimePicker
                      label="End Time"
                      value={formData.end_time}
                      onChange={(value) => updateFormData("end_time", value)}
                      placeholder="00:00"
                    />
                  </div>

                  {/* Manual Midnight Toggle */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Moon size={16} className="text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Midnight Passed Event
                        </span>
                      </div>
                      <Switch
                        checked={formData.is_midnight_passed}
                        onChange={(checked) =>
                          updateFormData("is_midnight_passed", checked)
                        }
                        size="small"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enable if this event crosses midnight (e.g., 23:00 to
                      02:00)
                    </p>
                  </div>

                  {/* FIXED: Show End Date field with proper date limits */}
                  {formData.is_midnight_passed && (
                    <div>
                      <CustomDatePicker
                        label="Show End Date (Required)"
                        value={formData.show_end_date}
                        onChange={(value) =>
                          updateFormData("show_end_date", value)
                        }
                        placeholder="Required for midnight events"
                        minDate={showEndMinDate}
                        maxDate={showEndMaxDate}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        💡 Select the date when the event should show as ended.
                        Must be within event period.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tickets Section (same as before) */}
              <div>
                {isSeatBased ? (
                  <CustomSelect
                    label="Seat Structure"
                    value={formData.seat_structure_id}
                    onChange={(value) =>
                      updateFormData("seat_structure_id", value)
                    }
                    options={availableSeats}
                    placeholder="Select seat structure"
                    icon={Users}
                    required={true}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <CustomSelect
                      label="Ticket Type"
                      value={formData.ticket_structure_id}
                      onChange={(value) =>
                        updateFormData("ticket_structure_id", value)
                      }
                      options={ticketOptions}
                      placeholder="Select type"
                      icon={Ticket}
                      required={true}
                    />
                    <CustomSelect
                      label="Ticket Set"
                      value={formData.ticket_set}
                      onChange={(value) => updateFormData("ticket_set", value)}
                      options={ticketSetOptions}
                      placeholder={
                        formData.ticket_structure_id
                          ? "Select set"
                          : "Select type first"
                      }
                      icon={Settings}
                      required={true}
                    />
                  </div>
                )}
                {/* <div className="grid grid-cols-2 gap-3">
                  <CustomSelect
                    label="Offer"
                    value={formData.offer_ids}
                    mode="multiple"
                    onChange={(value) => updateFormData("offer_ids", value)}
                    options={availableOffers}
                    placeholder="Select offer"
                    icon={BadgePercent}
                    required={false}
                  />
                  <CustomSelect
                    label="Coupon"
                    mode="multiple"
                    value={formData.coupon_ids}
                    onChange={(value) => updateFormData("coupon_ids", value)}
                    options={availableCoupons}
                    placeholder={"Select coupon"}
                    icon={Tag}
                    required={false}
                  />
                </div> */}
              </div>
            </div>

            {/* Right Column - Details Section */}
            <div>
              {/* Date Validation Error */}
              {dateValidationError && (
                <div className="p-3 bg-red-50 rounded-xl mb-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800">
                        Date Validation Error
                      </div>
                      <div className="text-xs text-red-700 mt-0.5">
                        {dateValidationError}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Conflict Warning */}
              {conflictWarning && (
                <div className="p-3 bg-red-50 rounded-xl mb-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800">
                        Conflict Detected
                      </div>
                      <div className="text-xs text-red-700 mt-0.5">
                        {conflictWarning}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-xl shadow-sm p-4 border border-gray-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {/* Show event date range - full width */}
                  {minDate && maxDate && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Event Period
                      </div>
                      <div className="text-gray-700 text-xs">
                        {minDate.toLocaleDateString()} -{" "}
                        {maxDate.toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {selectedEvent && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Event</div>
                      <div className="text-gray-900 font-medium">
                        {selectedEvent.event_name}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Date</div>
                    <div className="text-gray-900">
                      {formData.start_date
                        ? formData.start_date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not selected"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Time</div>
                    <div className="text-gray-900">
                      {formData.start_time} - {formData.end_time}
                      {formData.is_midnight_passed && (
                        <span className="text-orange-600 ml-2 font-medium">
                          (crosses midnight)
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.is_midnight_passed && formData.show_end_date && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Show End Date
                      </div>
                      <div className="text-orange-700 font-medium">
                        {formData.show_end_date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  )}

                  {isSeatBased && formData.seat_structure_id && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Seat Structure
                      </div>
                      <div className="text-gray-900">
                        {availableSeats.find(
                          (seat) => seat.value === formData.seat_structure_id
                        )?.label || "Unknown"}
                      </div>
                    </div>
                  )}

                  {!isSeatBased && formData.ticket_structure_id && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Ticket Type
                      </div>
                      <div className="text-gray-900">
                        {ticketOptions.find(
                          (opt) => opt.value === formData.ticket_structure_id
                        )?.label || "Unknown"}
                      </div>
                    </div>
                  )}

                  {!isSeatBased && formData.ticket_set && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Ticket Set
                      </div>
                      <div className="text-gray-900">
                        {ticketSetOptions.find(
                          (opt) => opt.value === formData.ticket_set
                        )?.label || "Unknown"}
                      </div>
                    </div>
                  )}

                  {formData.offer_ids && formData.offer_ids.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Offers</div>
                      <div className="text-gray-900">
                        {formData.offer_ids
                          .map(
                            (id) =>
                              availableOffers.find((opt) => opt.value === id)
                                ?.label
                          )
                          .filter(Boolean)
                          .join(", ") || "Unknown"}
                      </div>
                    </div>
                  )}

                  {formData.coupon_ids && formData.coupon_ids.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Coupons</div>
                      <div className="text-gray-900">
                        {formData.coupon_ids
                          .map(
                            (id) =>
                              availableCoupons.find((opt) => opt.value === id)
                                ?.label
                          )
                          .filter(Boolean)
                          .join(", ") || "Unknown"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex mt-8 items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0">
            {event ? (
              <Button
                danger
                icon={<Trash2 size={16} />}
                onClick={handleDelete}
                size="middle"
              >
                Delete
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button onClick={handleClose} size="middle">
                Cancel
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSave}
                disabled={!isFormValid() || !!conflictWarning}
                size="middle"
              >
                {event ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventModal;
