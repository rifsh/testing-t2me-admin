import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { DateTimeHelpers } from "../utils/DateTimeHelpers";

const TimePicker = ({
  selectedTime,
  onTimeSelect,
  format = "12",
  intervalMinutes = 15,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const timeListRef = useRef(null);

  const timeSlots = useMemo(
    () => DateTimeHelpers.generateTimeSlots(intervalMinutes),
    [intervalMinutes]
  );

  const filteredSlots = useMemo(() => {
    if (!searchTerm) return timeSlots;
    return timeSlots.filter((slot) =>
      slot.time12.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [timeSlots, searchTerm]);

  useEffect(() => {
    if (selectedTime && timeListRef.current) {
      const selectedIndex = timeSlots.findIndex(
        (slot) =>
          slot.hour === selectedTime.hour && slot.minute === selectedTime.minute
      );

      if (selectedIndex !== -1) {
        setTimeout(() => {
          const selectedElement = timeListRef.current?.children[selectedIndex];
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [selectedTime, timeSlots]);

  const handleTimeSelect = (slot) => {
    onTimeSelect({ hour: slot.hour, minute: slot.minute });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search time..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div
        ref={timeListRef}
        className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
        style={{ maxHeight: "240px" }}
      >
        {filteredSlots.length === 0 ? (
          <div className="text-center text-gray-500 py-6 text-sm">No times found</div>
        ) : (
          filteredSlots.map((slot, index) => {
            const isSelected =
              selectedTime &&
              selectedTime.hour === slot.hour &&
              selectedTime.minute === slot.minute;

            return (
              <button
                key={index}
                onClick={() => handleTimeSelect(slot)}
                className={`w-full px-3 py-2 rounded-md text-left text-sm transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {format === "12" ? slot.time12 : slot.time24}
              </button>
            );
          })
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TimePicker;
