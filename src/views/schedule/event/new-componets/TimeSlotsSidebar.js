import React, { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Copy, AlertCircle } from "lucide-react";
import { formatTime, ScheduleUtil } from "../utils";
import { message, Modal } from "antd";

const TimeSlotsSidebar = ({
  allEvents,
  onEventClick,
  onEventDelete,
  onEventUpdate,
  onApplyToAll,
  allDaysInRange,
}) => {
  const [expandedSlots, setExpandedSlots] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showApplyConfirmModal, setShowApplyConfirmModal] = useState(false);
  const [pendingApplySlot, setPendingApplySlot] = useState(null);

  // FIXED: Group events by time slot (ignoring day and type) - only show time slots
  const getTimeSlots = () => {
    const timeSlots = {};

    allEvents.forEach((event) => {
      if (!event.startTime || !event.endTime) return;

      const timeKey = `${event.startTime.hour}:${(event.startTime.minute || 0)
        .toString()
        .padStart(2, "0")}-${event.endTime.hour}:${(event.endTime.minute || 0)
        .toString()
        .padStart(2, "0")}`;

      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = {
          startTime: event.startTime,
          endTime: event.endTime,
          events: [],
          timeDisplay: `${formatTime(
            event.startTime.hour,
            event.startTime.minute || 0
          )} - ${formatTime(event.endTime.hour, event.endTime.minute || 0)}`,
          duration: ScheduleUtil.formatDuration(event.startTime, event.endTime),
        };
      }

      timeSlots[timeKey].events.push(event);
    });

    // Sort by start time and limit to 6 slots for better UI
    const sortedSlots = Object.entries(timeSlots).sort(([, a], [, b]) => {
      const aStart = a.startTime.hour * 60 + (a.startTime.minute || 0);
      const bStart = b.startTime.hour * 60 + (b.startTime.minute || 0);
      return aStart - bStart;
    });

    // FIXED: Show only 6 time slots as requested
    return sortedSlots.slice(0, 6);
  };

  const toggleSlotExpansion = (timeKey) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [timeKey]: !prev[timeKey],
    }));
  };

  const handleDropdownToggle = (timeKey) => {
    setDropdownOpen(dropdownOpen === timeKey ? null : timeKey);
  };

  // FIXED Enhanced Apply to All with confirmation modal
  const handleApplyToAll = (timeSlot) => {
    // CRITICAL CHECK: Prevent multi-day apply when multi-date is disabled
    const isMultiDay = timeSlot.startTime.day !== timeSlot.endTime.day;

    // Check if multiDateSelectionEnabled is available (should be passed as prop)
    // For now, we'll check if any events in this slot are multi-day
    const hasMultiDayEvents = timeSlot.events.some(
      (event) => event.startTime?.day !== event.endTime?.day
    );

    if (hasMultiDayEvents || isMultiDay) {
      message.error(
        "Cannot apply multi-day time slot to all days. Enable multi-date selection first.",
        4
      );
      setDropdownOpen(null);
      return;
    }

    setPendingApplySlot(timeSlot);
    setShowApplyConfirmModal(true);
    setDropdownOpen(null);
  };

  const confirmApplyToAll = () => {
    if (!pendingApplySlot) return;

    const templateEvent = {
      id: `temp-apply-${Date.now()}`,
      type: pendingApplySlot.events[0].type || "meeting",
      startTime: {
        day: 0, // This will be replaced for each day
        hour: pendingApplySlot.startTime.hour,
        minute: pendingApplySlot.startTime.minute || 0,
      },
      endTime: {
        day: 0, // This will be replaced for each day (unless multi-day)
        hour: pendingApplySlot.endTime.hour,
        minute: pendingApplySlot.endTime.minute || 0,
      },
    };

    console.log("Sidebar Apply to All Confirmed:", {
      templateEvent,
      allDaysInRange: allDaysInRange.length,
      timeSlot: pendingApplySlot.timeDisplay,
    });

    onApplyToAll(templateEvent);

    setShowApplyConfirmModal(false);
    setPendingApplySlot(null);

    message.info(
      `Applying ${pendingApplySlot.timeDisplay} to all ${allDaysInRange.length} days...`
    );
  };

  const handleEventDelete = (event) => {
    onEventDelete(event.id);
    setDropdownOpen(null);
  };

  const handleEventUpdate = (event) => {
    onEventUpdate(event);
    setDropdownOpen(null);
  };

  const timeSlots = getTimeSlots();

  // Apply to All Confirmation Modal
  const ApplyToAllModal = () => (
    <Modal
      title="Apply Time Slot to All Days"
      open={showApplyConfirmModal}
      onOk={confirmApplyToAll}
      onCancel={() => {
        setShowApplyConfirmModal(false);
        setPendingApplySlot(null);
      }}
      okText="Apply to All"
      cancelText="Cancel"
      okButtonProps={{ type: "primary" }}
      centered
    >
      {pendingApplySlot && (
        <div className="py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Copy className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Apply to All Days
              </h3>
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-blue-800">
                  Time Slot: {pendingApplySlot.timeDisplay}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Duration: {pendingApplySlot.duration} • Type:{" "}
                  {pendingApplySlot.events[0]?.type || "meeting"}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This will apply the selected time slot to all{" "}
                <strong>{allDaysInRange.length} days</strong> in your date
                range. Days with conflicting events will be skipped
                automatically.
              </p>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">
                    Days with conflicts will be skipped and reported
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  if (timeSlots.length === 0) {
    return (
      <>
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Time Slots</h4>
          <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            No time slots scheduled
          </div>
        </div>
        <ApplyToAllModal />
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Time Slots ({timeSlots.length}
          {timeSlots.length >= 6 ? "+" : ""})
        </h4>
        <div className="space-y-2">
          {timeSlots.map(([timeKey, slot]) => (
            <div
              key={timeKey}
              className="bg-white rounded-xl border border-gray-100 p-3 relative hover:shadow-sm transition-shadow"
            >
              {/* Time Slot Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {slot.timeDisplay}
                  </div>
                  <div className="text-xs text-gray-500">
                    {slot.duration} • {slot.events.length} event
                    {slot.events.length !== 1 ? "s" : ""}
                    {slot.events.length > 0 && (
                      <span className="ml-1 text-blue-600">
                        • {slot.events[0].type || "meeting"}
                      </span>
                    )}
                  </div>
                </div>

                {/* FIXED: Dropdown menu with requested options */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle(timeKey);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                    title="More options"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {dropdownOpen === timeKey && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-[4999]"
                        onClick={() => setDropdownOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[5000] min-w-36">
                        <button
                          onClick={() => handleEventUpdate(slot.events[0])}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <Edit size={12} />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => handleEventDelete(slot.events[0])}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => handleApplyToAll(slot)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 text-blue-600 transition-colors flex items-center space-x-2 border-t border-gray-100"
                        >
                          <Copy size={12} />
                          <span>Apply to All</span>
                        </button>
                        <button
                          onClick={() => {
                            toggleSlotExpansion(timeKey);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 text-gray-600 transition-colors border-t border-gray-100"
                        >
                          {expandedSlots[timeKey]
                            ? "Hide Details"
                            : "Show Details"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Apply Button */}
              <button
                onClick={() => handleApplyToAll(slot)}
                className="w-full mt-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Copy size={12} />
                <span>Apply to All {allDaysInRange.length} Days</span>
              </button>

              {/* Expanded Events List */}
              {expandedSlots[timeKey] && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Events ({slot.events.length}):
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {slot.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-700">
                            Day {event.startTime.day + 1}
                            {event.isMultiDay && (
                              <span className="ml-1 px-1 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                Multi-day
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {event.type || "meeting"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(
                            event.startTime.hour,
                            event.startTime.minute || 0
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ApplyToAllModal />
    </>
  );
};

export default TimeSlotsSidebar;
