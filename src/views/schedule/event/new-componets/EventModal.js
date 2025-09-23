// EventModal.jsx - Fixed modal for single day selections only
import React, { useState, useEffect } from "react";
import { X, Clock, MoreHorizontal } from "lucide-react";
import { formatTime, ScheduleUtil } from "../utils";
import { message } from "antd";

const EventModal = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  onApplyToAll,
  allDays = [],
  existingEvents = [],
}) => {
  const [type, setType] = useState("meeting");
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [conflictError, setConflictError] = useState("");

  useEffect(() => {
    if (event) {
      setType(event?.type || "meeting");
      setStartHour(event?.startTime?.hour || 9);
      setStartMinute(event?.startTime?.minute || 0);
      setEndHour(event?.endTime?.hour || 10);
      setEndMinute(event?.endTime?.minute || 0);
    }
  }, [event]);

  const eventTypes = [
    { value: "meeting", label: "Gold", color: "bg-blue-100" },
    { value: "task", label: "Platinum", color: "bg-green-100" },
    { value: "reminder", label: "Silver", color: "bg-yellow-100" },
    { value: "personal", label: "Standard", color: "bg-purple-100" },
    { value: "urgent", label: "Normal", color: "bg-red-100" },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  // Check for conflicts whenever time changes
  useEffect(() => {
    if (event && event.startTime) {
      const updatedEvent = {
        ...event,
        startTime: {
          ...event.startTime,
          hour: startHour,
          minute: startMinute,
        },
        endTime: {
          ...event.endTime,
          hour: endHour,
          minute: endMinute,
        },
      };

      const hasConflict = ScheduleUtil.checkConflict(
        updatedEvent,
        existingEvents,
        event.id
      );

      if (hasConflict) {
        const conflictingEvents = ScheduleUtil.findConflictingEvents(
          updatedEvent,
          existingEvents,
          event.id
        );
        setConflictError(
          `Conflicts with ${conflictingEvents.length} existing event(s)`
        );
      } else {
        setConflictError("");
      }
    }
  }, [startHour, startMinute, endHour, endMinute, event, existingEvents]);

  const handleSave = () => {
    const selectedType = eventTypes.find((t) => t.value === type);
    const updatedEvent = {
      ...event,
      type,
      color: selectedType.color,
      startTime: {
        ...event?.startTime,
        hour: startHour,
        minute: startMinute,
      },
      endTime: {
        ...event?.endTime,
        hour: endHour,
        minute: endMinute,
        day: event?.startTime?.day || 0, // FIXED: Ensure same day
      },
    };

    // FIXED: Validate single day only
    if (updatedEvent.startTime.day !== updatedEvent.endTime.day) {
      message.error("Events must be within a single day");
      return;
    }

    const validation = ScheduleUtil.validateTimeSlot(
      updatedEvent.startTime,
      updatedEvent.endTime
    );
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }

    const hasConflict = ScheduleUtil.checkConflict(
      updatedEvent,
      existingEvents,
      event?.id
    );

    if (hasConflict) {
      message.error("Cannot save: Time slot conflicts with existing events");
      return;
    }

    onSave(updatedEvent);
    onClose();
  };

  const handleApplyToAll = () => {
    if (!allDays.length || !event) return;

    const selectedType = eventTypes.find((t) => t.value === type);
    const templateEvent = {
      ...event,
      type,
      color: selectedType.color,
      startTime: {
        day: 0,
        hour: startHour,
        minute: startMinute,
      },
      endTime: {
        day: 0, // FIXED: Always same day
        hour: endHour,
        minute: endMinute,
      },
    };

    onApplyToAll(templateEvent);
    onClose();
  };

  const handleClose = () => {
    if (event) {
      setType(event?.type || "meeting");
      setStartHour(event?.startTime?.hour || 9);
      setStartMinute(event?.startTime?.minute || 0);
      setEndHour(event?.endTime?.hour || 10);
      setEndMinute(event?.endTime?.minute || 0);
    }
    setShowMoreOptions(false);
    setConflictError("");
    onClose();
  };

  if (!isOpen) return null;

  const isNewEvent = !event?.id || event?.id.startsWith("temp-");
  const canApplyToAll = isNewEvent && allDays.length > 1;
  const hasConflict = conflictError !== "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999999999]">
      <div className="bg-white rounded-xl shadow-2xl w-96 p-6 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNewEvent ? "New Event" : "Edit Event"}
            <span className="text-sm text-green-600 ml-2">(Single Day)</span>
          </h3>
          <div className="flex items-center space-x-2">
            {canApplyToAll && (
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="More options"
              >
                <MoreHorizontal size={20} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {hasConflict && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800 font-medium">
                ⚠️ Time Conflict
              </div>
              <div className="text-xs text-red-600 mt-1">{conflictError}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType.value}
                  onClick={() => setType(eventType.value)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    type === eventType.value
                      ? `${eventType.color} text-gray-800 shadow-md border-gray-300`
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {eventType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time (Same Day Only)
            </label>
            <div className="space-y-3">
              {/* Start Time */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Start Time</div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div>
                <div className="text-xs text-gray-500 mb-1">End Time</div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">:</span>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Duration Display */}
            <div className="mt-2 text-xs text-gray-500">
              Duration:{" "}
              {ScheduleUtil.formatDuration(
                { hour: startHour, minute: startMinute },
                { hour: endHour, minute: endMinute }
              )}
            </div>
          </div>

          {/* Apply to All Option */}
          {showMoreOptions && canApplyToAll && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-800 mb-2">
                Apply to All Days
              </div>
              <div className="text-xs text-blue-600 mb-3">
                This will create the same event for all {allDays.length} days in
                your selection (skipping days that already have conflicting
                events)
              </div>
              <button
                onClick={handleApplyToAll}
                className="w-full bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition-colors text-sm font-medium"
              >
                Apply to All {allDays.length} Days
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            {!isNewEvent && (
              <button
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={hasConflict}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                hasConflict
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {isNewEvent ? "Create" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
