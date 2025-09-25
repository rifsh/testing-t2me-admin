import React, { useState, useEffect, useRef } from "react";
import { Button, message } from "antd";
import {
  Clock,
  Calendar,
  Users,
  Copy,
  Trash2,
  X,
  AlertTriangle,
  ChevronDown,
  Ticket,
  Settings,
  Lock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetails } from "store/slices/eventSlice";
import { ScheduleUtil } from "../utils";

const CustomDatePicker = ({
  value,
  onChange,
  placeholder = "Select Date",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setTempDate(new Date(value));
    }
  }, [value]);

  const formatDisplayDate = (date) => {
    if (!date) return placeholder;
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCurrentDateString = () => {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-gray-800 cursor-pointer"
      >
        <div className="flex items-center">
          <Calendar size={16} className="mr-2" />
          <span>{formatDisplayDate(value)}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-full min-w-[280px]"
        >
          <input
            type="date"
            value={getCurrentDateString()}
            onChange={handleDateChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomTimePicker = ({
  value,
  onChange,
  placeholder = "Select Time",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value || "09:00");
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = () => {
    onChange(tempTime);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-gray-800 cursor-pointer"
      >
        <div className="flex items-center">
          <Clock size={16} className="mr-2" />
          <span>{value || placeholder}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-full min-w-[250px]"
        >
          <input
            type="time"
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  label,
  icon: IconComponent = Users,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-sm rounded-xl border-2 transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
          ${
            required && !value
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : "border-gray-200 bg-white hover:border-blue-300"
          }
          ${value ? "text-gray-800" : "text-gray-400"}`}
      >
        <div className="flex items-center min-w-0">
          <IconComponent size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={selectRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 w-full max-h-60 overflow-y-auto"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-100 transition-colors
                  ${
                    value === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-800"
                  }`}
              >
                <div className="truncate">{option.label}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

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
}) => {
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [showMultiDayWarning, setShowMultiDayWarning] = useState(false);

  const [formData, setFormData] = useState({
    startDate: null,
    startTime: "09:00",
    endTime: "10:00",
    ticketType: null,
    ticketSet: null,
    seatStructure: null,
  });

  const dispatch = useDispatch();
  const { selectedTicketType } = useSelector((state) => state.tickets || {});
  const { eventDetails, selectedEvent } = useSelector(
    (state) => state.event || {}
  );
  const { selectedVenue } = useSelector((state) => state.locations || {});

  useEffect(() => {
    const eventId = parentForm?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, parentForm]);

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
    if (!eventDetails?.venue_ticket_structures || !formData.ticketType)
      return [];

    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );

    if (!venueTicketStructure) return [];

    const selectedTicketStructure = venueTicketStructure.ticket_structures.find(
      (structure) => structure.ticket_structure === formData.ticketType
    );

    if (!selectedTicketStructure?.ticket_sets) return [];

    return selectedTicketStructure.ticket_sets.map((set) => ({
      value: set.id || set,
      label: set.name || `Ticket Set ${set}`,
    }));
  }, [eventDetails, selectedVenue, formData.ticketType]);

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

  useEffect(() => {
    if (isOpen && event) {
      const isMultiDay =
        event.isMultiDay ||
        (event.originalStartDay !== undefined &&
          event.originalEndDay !== undefined &&
          event.originalStartDay !== event.originalEndDay) ||
        event.startTime?.day !== event.endTime?.day;

      if (isMultiDay) {
        setShowMultiDayWarning(true);
        return;
      }
    }
  }, [isOpen, event]);

  useEffect(() => {
    if (isOpen && !showMultiDayWarning) {
      if (event) {
        let startDate = null;

        if (allDays && allDays.length > 0) {
          const startDayIndex =
            event.originalStartDay !== undefined
              ? event.originalStartDay
              : event.startTime.day;

          if (startDayIndex >= 0 && startDayIndex < allDays.length) {
            startDate = allDays[startDayIndex];
          }
        }

        setFormData({
          startDate,
          startTime: `${event.startTime.hour.toString().padStart(2, "0")}:${(
            event.startTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          endTime: `${event.endTime.hour.toString().padStart(2, "0")}:${(
            event.endTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          ticketType: event.ticketType,
          ticketSet: event.ticketSet,
          seatStructure: event.seat_structure_id,
        });
      } else {
        const defaultDate =
          allDays && allDays.length > 0 ? allDays[0] : new Date();

        setFormData({
          startDate: defaultDate,
          startTime: "09:00",
          endTime: "10:00",
          ticketType: null,
          ticketSet: null,
          seatStructure: null,
        });
      }
    }
  }, [isOpen, event, allDays, showMultiDayWarning]);

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "ticketType") {
        updated.ticketSet = null;
      }

      return updated;
    });

    const updatedData = { ...formData, [field]: value };
    checkConflicts(updatedData);
  };

  const checkConflicts = (data) => {
    if (!data.startDate || !data.startTime || !data.endTime || !allDays) {
      setConflictWarning(null);
      return;
    }

    const startDayIndex = allDays.findIndex(
      (day) => day.toDateString() === data.startDate.toDateString()
    );

    if (startDayIndex === -1) {
      setConflictWarning("Selected date is outside the current range");
      return;
    }

    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);

    const testEvent = {
      id: event?.id || "test",
      startTime: { day: startDayIndex, hour: startHour, minute: startMinute },
      endTime: { day: startDayIndex, hour: endHour, minute: endMinute },
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

  const isFormValid = () => {
    const requiredFields = [
      "startDate",
      "startTime",
      "endTime",
      "ticketType",
      "ticketSet",
    ];

    if (selectedTicketType === 1) {
      requiredFields.push("seatStructure");
    }

    return requiredFields.every(
      (field) =>
        formData[field] !== null &&
        formData[field] !== undefined &&
        formData[field] !== ""
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!formData.startDate || !formData.startTime || !formData.endTime) {
        message.error("Please fill in all required time fields");
        return;
      }

      if (!formData.ticketType) {
        message.error("Please select a ticket type");
        return;
      }

      if (!formData.ticketSet) {
        message.error("Please select a ticket set");
        return;
      }

      if (selectedTicketType === 1 && !formData.seatStructure) {
        message.error("Please select a seat structure");
        return;
      }

      if (conflictWarning) {
        message.error("Please resolve conflicts before saving");
        return;
      }

      const startDayIndex = allDays.findIndex(
        (day) => day.toDateString() === formData.startDate.toDateString()
      );

      if (startDayIndex === -1) {
        message.error("Selected date is outside the current range");
        return;
      }

      const [startHour, startMinute] = formData.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = formData.endTime.split(":").map(Number);

      const advertisementStartTime = parentForm?.getFieldValue(
        "advertisement_start_time"
      );
      const bookingStartTime = parentForm?.getFieldValue("booking_start_time");

      const eventData = {
        id: event?.id || `temp-${Date.now()}`,
        type: "timeslot",
        isMultiDay: false,
        startTime: { day: startDayIndex, hour: startHour, minute: startMinute },
        endTime: { day: startDayIndex, hour: endHour, minute: endMinute },
        originalStartDay: startDayIndex,
        originalEndDay: startDayIndex,
        ticketType: formData.ticketType,
        ticketSet: formData.ticketSet,
        seat_structure_id: formData.seatStructure,
        advertisement_start_time: advertisementStartTime,
        booking_start_time: bookingStartTime,
        event_id: parentForm?.getFieldValue("event_id"),
        venue_id: parentForm?.getFieldValue("venue_id"),
        max_ticket_per_booking: parentForm?.getFieldValue(
          "max_ticket_per_booking"
        ),
        booking_limit_per_user: parentForm?.getFieldValue(
          "booking_limit_per_user"
        ),
      };

      onSave(eventData);
      onClose();
    } catch (error) {
      message.error("Please check your input and try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && event?.id) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleApplyToAll = () => {
    if (onApplyToAll && event) {
      onApplyToAll(event);
      onClose();
    }
  };

  const handleMultiDayWarningClose = () => {
    setShowMultiDayWarning(false);
    onClose();
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (showMultiDayWarning) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[999] flex items-center justify-center"
          onClick={handleMultiDayWarningClose}
        />

        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Cannot Edit Multi-day Time Slot
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You cannot edit multi-day time slots. Please remove the current
                slot and create a new one instead.
              </p>
              <div className="flex space-x-4">
                <Button
                  size="large"
                  onClick={handleMultiDayWarningClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  danger
                  size="large"
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Delete Slot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const advertisementStartTime = parentForm?.getFieldValue(
    "advertisement_start_time"
  );
  const bookingStartTime = parentForm?.getFieldValue("booking_start_time");

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[999] flex items-center justify-center"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {event ? "Edit Time Slot" : "Create Time Slot"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 140px)" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Date & Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomDatePicker
                      label="Date"
                      value={formData.startDate}
                      onChange={(value) => updateFormData("startDate", value)}
                      placeholder="Select date"
                    />

                    <CustomTimePicker
                      label="Start Time"
                      value={formData.startTime}
                      onChange={(value) => updateFormData("startTime", value)}
                      placeholder="Start time"
                    />

                    <CustomTimePicker
                      label="End Time"
                      value={formData.endTime}
                      onChange={(value) => updateFormData("endTime", value)}
                      placeholder="End time"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Tickets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect
                      label="Ticket Type"
                      value={formData.ticketType}
                      onChange={(value) => updateFormData("ticketType", value)}
                      options={ticketOptions}
                      placeholder="Select ticket type"
                      icon={Ticket}
                      required={true}
                    />

                    <CustomSelect
                      label="Ticket Set"
                      value={formData.ticketSet}
                      onChange={(value) => updateFormData("ticketSet", value)}
                      options={ticketSetOptions}
                      placeholder={
                        formData.ticketType
                          ? "Select ticket set"
                          : "Select ticket type first"
                      }
                      icon={Settings}
                      required={true}
                    />
                  </div>
                </div>

                {selectedTicketType === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Seating
                    </h3>
                    <CustomSelect
                      label="Seat Structure"
                      value={formData.seatStructure}
                      onChange={(value) =>
                        updateFormData("seatStructure", value)
                      }
                      options={availableSeats}
                      placeholder="Select seat structure"
                      icon={Users}
                      required={true}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Event Details
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
                    <div className="space-y-4">
                      {selectedEvent && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">
                            {selectedEvent.event_name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {formData.startDate
                            ? formData.startDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })
                            : "No date selected"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {formData.startTime} - {formData.endTime}
                        </span>
                      </div>

                      {formData.ticketType && (
                        <div className="flex items-center space-x-3">
                          <Ticket className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">
                            {ticketOptions.find(
                              (opt) => opt.value === formData.ticketType
                            )?.label || "Unknown Ticket Type"}
                          </span>
                        </div>
                      )}

                      {formData.ticketSet && (
                        <div className="flex items-center space-x-3">
                          <Settings className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">
                            {ticketSetOptions.find(
                              (opt) => opt.value === formData.ticketSet
                            )?.label || "Unknown Ticket Set"}
                          </span>
                        </div>
                      )}

                      {selectedTicketType === 1 && formData.seatStructure && (
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">
                            {availableSeats.find(
                              (seat) => seat.value === formData.seatStructure
                            )?.label || "Unknown Seat Structure"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(advertisementStartTime || bookingStartTime) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Booking Schedule
                    </h3>
                    <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
                      <div className="space-y-3">
                        {advertisementStartTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">
                              Advertisement Start:
                            </span>
                            <span className="text-sm font-medium text-green-800">
                              {new Date(
                                advertisementStartTime
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {bookingStartTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">
                              Booking Start:
                            </span>
                            <span className="text-sm font-medium text-green-800">
                              {new Date(bookingStartTime).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {conflictWarning && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-800">
                          Conflict Detected
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          {conflictWarning}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {event ? (
              <div className="flex space-x-3">
                <Button
                  danger
                  size="large"
                  icon={<Trash2 size={18} />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  size="large"
                  icon={<Copy size={18} />}
                  onClick={handleApplyToAll}
                >
                  Apply to All
                </Button>
              </div>
            ) : (
              <div />
            )}

            <div className="flex space-x-3">
              <Button size="large" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={handleSave}
                disabled={!isFormValid() || !!conflictWarning}
                className="px-8"
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
