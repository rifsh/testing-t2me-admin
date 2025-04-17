// ScheduleGrid.jsx
import React from "react";

export default function ScheduleGrid({ screens, hourWidth, rowHeight }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="relative ">
      {screens.map((screen) => (
        <div key={screen.id} className="flex">
          <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center border-b border-r border-gray-200 ">
            <span className="font-medium p-2">{screen.name}</span>
          </div>
          <div className="flex h-20 border-b border-gray-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-shrink-0 border-r border-gray-200"
                style={{ width: `${hourWidth}px`, height: `${rowHeight}px` }}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
