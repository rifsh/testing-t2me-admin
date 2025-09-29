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
  Move,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetails } from "store/slices/eventSlice";
import { ScheduleUtil } from "../utils";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";
import CustomSelect from "./CustomSelect";

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

  // Enhanced dragging states - similar to CompactDateTimePicker
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    start_date: null, // Fixed field name from startDate
    start_time: "09:00", // Fixed field name from startTime
    end_time: "10:00", // Fixed field name from endTime
    ticket_structure_id: null, // Fixed field name from ticketType
    ticket_set: null, // Already correct
    seat_structure_id: null, // Fixed field name from seatStructure
  });

  const dispatch = useDispatch();
  const { selectedTicketType } = useSelector((state) => state.tickets || {});
  const { eventDetails, selectedEvent } = useSelector(
    (state) => state.event || {}
  );
  const { selectedVenue } = useSelector((state) => state.locations || {});

  // Enhanced dragging handlers - similar to CompactDateTimePicker
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

      // Get modal dimensions for boundary constraints
      const maxX = window.innerWidth - 600; // Modal width
      const maxY = window.innerHeight - 700; // Approximate modal height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced dragging effect - similar to CompactDateTimePicker
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

  // Reset position when closing
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

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

  useEffect(() => {
    if (isOpen && event) {
      const isMultiDay =
        event.is_multi_date ||
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
        let start_date = null;

        if (allDays && allDays.length > 0) {
          const startDayIndex =
            event.originalStartDay !== undefined
              ? event.originalStartDay
              : event.startTime.day;

          if (startDayIndex >= 0 && startDayIndex < allDays.length) {
            start_date = allDays[startDayIndex];
          }
        }

        setFormData({
          start_date,
          start_time: `${event.startTime.hour.toString().padStart(2, "0")}:${(
            event.startTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          end_time: `${event.endTime.hour.toString().padStart(2, "0")}:${(
            event.endTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          ticket_structure_id: event.ticket_structure_id,
          ticket_set: event.ticket_set,
          seat_structure_id: event.seat_structure_id,
        });
      } else {
        const defaultDate =
          allDays && allDays.length > 0 ? allDays[0] : new Date();

        setFormData({
          start_date: defaultDate,
          start_time: "09:00",
          end_time: "10:00",
          ticket_structure_id: null,
          ticket_set: null,
          seat_structure_id: null,
        });
      }
    }
  }, [isOpen, event, allDays, showMultiDayWarning]);

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "ticket_structure_id") {
        updated.ticket_set = null;
      }

      return updated;
    });

    const updatedData = { ...formData, [field]: value };
    checkConflicts(updatedData);
  };

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
    const requiredFields = ["start_date", "start_time", "end_time"];

    if (selectedTicketType === 1) {
      requiredFields.push("seat_structure_id");
    } else {
      requiredFields.push("ticket_set");
      requiredFields.push("ticket_structure_id");
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

      if (!formData.start_date || !formData.start_time || !formData.end_time) {
        message.error("Please fill in all required time fields");
        return;
      }
      if (selectedTicketType !== 1) {
        if (!formData.ticket_structure_id) {
          message.error("Please select a ticket type");
          return;
        }

        if (!formData.ticket_set) {
          message.error("Please select a ticket set");
          return;
        }
      }

      if (selectedTicketType === 1 && !formData.seat_structure_id) {
        message.error("Please select a seat structure");
        return;
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

      const ad_start_date_time =
        parentForm?.getFieldValue("ad_start_date_time");
      const booking_start_date_time = parentForm?.getFieldValue(
        "booking_start_date_time"
      );

      // Updated event data structure with correct field names
      const eventData = {
        id: event?.id || `temp-${Date.now()}`,
        type: "timeslot",
        is_multi_date: false, // Changed from isMultiDay
        startTime: { day: startDayIndex, hour: startHour, minute: startMinute },
        endTime: { day: startDayIndex, hour: endHour, minute: endMinute },
        originalStartDay: startDayIndex,
        originalEndDay: startDayIndex,
        ticket_structure_id: formData.ticket_structure_id,
        ticket_set: formData.ticket_set,
        seat_structure_id: formData.seat_structure_id,
        ad_start_date_time: ad_start_date_time,
        booking_start_date_time: booking_start_date_time,
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
      resetPosition();
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
      resetPosition();
    }
  };

  const handleApplyToAll = () => {
    if (onApplyToAll && event) {
      onApplyToAll(event);
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
                <Button onClick={handleMultiDayWarningClose} className="flex-1">
                  Cancel
                </Button>
                <Button danger onClick={handleDelete} className="flex-1">
                  Delete Slot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const ad_start_date_time = parentForm?.getFieldValue("ad_start_date_time");
  const booking_start_date_time = parentForm?.getFieldValue(
    "booking_start_date_time"
  );

  // Check if modal is dragged
  const isDragged = position.x !== 0 || position.y !== 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[999] flex items-center justify-center"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        onMouseDown={handleMouseDown}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{
          ...(isDragged
            ? {
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 1000,
                userSelect: "none",
                cursor: isDragging ? "grabbing" : "default",
                pointerEvents: "auto",
              }
            : {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1000,
              }),
        }}
      >
        {/* Draggable Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="drag-handle flex items-center space-x-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors">
              <Move size={16} className="text-gray-400" />
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {event ? "Edit Time Slot" : "Create Time Slot"}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          <div className="grid  gap-8">
            <div className="space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomDatePicker
                    label="Date"
                    value={formData.start_date}
                    onChange={(value) => updateFormData("start_date", value)}
                    placeholder="Select date"
                  />

                  <CustomTimePicker
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(value) => updateFormData("start_time", value)}
                    placeholder="Start time"
                  />

                  <CustomTimePicker
                    label="End Time"
                    value={formData.end_time}
                    onChange={(value) => updateFormData("end_time", value)}
                    placeholder="End time"
                  />
                </div>
              </div>

              {selectedTicketType === 1 ? (
                <div>
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
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect
                      label="Ticket Type"
                      value={formData.ticket_structure_id}
                      onChange={(value) =>
                        updateFormData("ticket_structure_id", value)
                      }
                      options={ticketOptions}
                      placeholder="Select ticket type"
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
                          ? "Select ticket set"
                          : "Select ticket type first"
                      }
                      icon={Settings}
                      required={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-3">
                Event Details
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
                <div className="grid grid-cols-2 gap-4">
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
                      {formData.start_date
                        ? formData.start_date.toLocaleDateString("en-US", {
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
                      {formData.start_time} - {formData.end_time}
                    </span>
                  </div>

                  {formData.ticket_structure_id && (
                    <div className="flex items-center space-x-3">
                      <Ticket className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        {ticketOptions.find(
                          (opt) => opt.value === formData.ticket_structure_id
                        )?.label || "Unknown Ticket Type"}
                      </span>
                    </div>
                  )}

                  {formData.ticket_set && (
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        {ticketSetOptions.find(
                          (opt) => opt.value === formData.ticket_set
                        )?.label || "Unknown Ticket Set"}
                      </span>
                    </div>
                  )}

                  {selectedTicketType === 1 && formData.seat_structure_id && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        {availableSeats.find(
                          (seat) => seat.value === formData.seat_structure_id
                        )?.label || "Unknown Seat Structure"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

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

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {event ? (
            <div className="flex space-x-3">
              <Button danger icon={<Trash2 size={18} />} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex space-x-3">
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
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
    </>
  );
};

// Import these custom components
// import CustomDatePicker from "./CustomDatePicker";
// import CustomTimePicker from "./CustomTimePicker";
// import CustomSelect from "./CustomSelect";

export default EventModal;
