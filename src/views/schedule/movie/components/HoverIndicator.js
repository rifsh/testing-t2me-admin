// HoverIndicator.jsx
import React from "react";

export default function HoverIndicator({ hoverPosition, sidebarWidth, rowHeight }) {
  if (!hoverPosition.visible) return null;

  return (
    <>
      {/* Tooltip */}
      <div
        className="fixed bg-black text-white px-3 py-1 rounded-md shadow-lg text-sm z-50"
        style={{
          left: `${hoverPosition.x + 10}px`,
          top: `${hoverPosition.y + 10}px`,
        }}
      >
        <div className="font-medium">Screen: {hoverPosition.screen}</div>
        <div>Time: {hoverPosition.time}</div>
      </div>

      {/* Vertical time indicator line */}
      {hoverPosition.timeLineX !== undefined && (
        <div
          className="absolute top-0 h-full w-px bg-blue-500 z-10 pointer-events-none"
          style={{
            left: `${sidebarWidth + hoverPosition.timeLineX}px`,
          }}
        />
      )}

      {/* Horizontal screen indicator line */}
      {hoverPosition.screenLineY !== undefined && (
        <div
          className="absolute left-32 right-0 h-px bg-blue-500 z-10 pointer-events-none"
          style={{
            top: `${hoverPosition.screenLineY + rowHeight / 2}px`,
          }}
        />
      )}
    </>
  );
}