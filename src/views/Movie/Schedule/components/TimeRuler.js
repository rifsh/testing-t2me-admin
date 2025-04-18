// TimeRuler.jsx
import React from "react";
import { formatTime } from "./utils";

export default function TimeRuler({ hourWidth, timeRulerRef }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      ref={timeRulerRef}
      className="flex h-12 ml-32 border-b border-gray-200"
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="flex-shrink-0 border-r border-gray-200 flex items-end pb-2 justify-center"
          style={{ width: `${hourWidth}px` }}
        >
          <span className="text-xs text-gray-500">{formatTime(hour)}</span>
        </div>
      ))}
    </div>
  );
}