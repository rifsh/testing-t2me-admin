import React, { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import { formatTime, ScheduleUtil } from "../utils";
import { message } from "antd";

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

  // Enhanced Apply to All with better debugging
  const handleApplyToAll = (timeSlot) => {
    const templateEvent = {
      id: `temp-apply-${Date.now()}`,
      type: timeSlot.events[0].type,
      startTime: {
        day: 0, // This will be replaced for each day
        hour: timeSlot.startTime.hour,
        minute: timeSlot.startTime.minute || 0,
      },
      endTime: {
        day: 0, // This will be replaced for each day
        hour: timeSlot.endTime.hour,
        minute: timeSlot.endTime.minute || 0,
      },
    };

    console.log("Sidebar Apply to All:", {
      templateEvent,
      allDaysInRange: allDaysInRange.length,
      timeSlot: timeSlot.timeDisplay,
    });

    onApplyToAll(templateEvent);
    setDropdownOpen(null);

    message.info(
      `Attempting to apply ${timeSlot.timeDisplay} to all ${allDaysInRange.length} days...`
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

  if (timeSlots.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Time Slots</h4>
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
          No time slots scheduled
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 ">
      <h4 className="text-sm font-medium text-gray-700">
        Time Slots ({timeSlots.length}
        {timeSlots.length >= 6 ? "+" : ""})
      </h4>
      <div className="space-y-2 ">
        {timeSlots.map(([timeKey, slot]) => (
          <div
            key={timeKey}
            className="bg-white rounded-xl border border-gray-100 p-3 relative"
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
                  title="Show/Hide events"
                >
                  <MoreHorizontal size={14} />
                </button>

                {dropdownOpen === timeKey && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[5000] min-w-32">
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
                    {/* Add more options if needed */}
                    <button
                      onClick={() => {
                        // Add custom action here
                        setDropdownOpen(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 text-gray-600 transition-colors border-t border-gray-100"
                    >
                      More Options
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Apply to All Button */}

            {/* Expanded Events List */}
            {expandedSlots[timeKey] && (
              <div className="border-t border-gray-100 pt-2">
                <div className="space-y-1">
                  {slot.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => onEventClick(event)}
                      >
                        <div className="text-xs font-medium text-gray-700 capitalize">
                          Day {event.startTime.day + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.type}
                        </div>
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
  );
};

export default TimeSlotsSidebar;
