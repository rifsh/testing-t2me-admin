import React from "react";

// TimeHeader component for displaying time labels at the top of the timeline
const TimeHeader = ({ timeLabels, visibleWidth, formatTimeByZoom }) => {
  return (
    <div className="absolute top-0 left-24 right-0 h-12 bg-gray-100 border-b z-10 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: `${visibleWidth}px` }}
      >
        {timeLabels.map((label, index) => (
          <div
            key={index}
            className={`absolute h-full ${
              label.isMinor
                ? "border-l border-gray-200"
                : "border-l border-gray-300"
            } ${label.isHour ? "font-medium" : "text-gray-500"}`}
            style={{
              left: `${label.position}px`,
              height: label.isMinor ? "50%" : "100%",
              top: label.isMinor ? "50%" : "0",
            }}
          >
            {!label.isMinor && (
              <div className="px-1 py-2">
                {formatTimeByZoom(label.time, label.isHour)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeHeader;