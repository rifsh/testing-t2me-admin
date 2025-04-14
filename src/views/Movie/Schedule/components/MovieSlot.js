import React, { useEffect, useState, useRef } from "react";
import { Tooltip } from "antd";

export const MovieSlot = ({
  movie,
  formatTime,
  screens,
  onClick,
  scale,
  isSelected,
  onDragEnd,
  timelineRef,
  xDomain,
  rowHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });

  // Calculate position and size based on movie time and duration
  const left = (movie.startTime - xDomain[0]) * scale.x;
  const width = Math.max(40, (movie.endTime - movie.startTime) * scale.x); // Ensure minimum width

  // Duration of the movie in hours
  const movieDuration = (movie.duration || 0) / 60;

  // Interval time in hours
  const intervalDuration = (movie.intervalTime || 0) / 60;

  // Visual styling based on selection and drag status
  const lineColor = isSelected
    ? "border-green-500"
    : isDragging
    ? "border-blue-500"
    : "border-indigo-400";
  const lineWidth = isSelected || isDragging ? "border-2" : "border";
  const bgColor = isSelected
    ? "bg-green-50"
    : isDragging
    ? "bg-blue-50"
    : "bg-white";

  // Handle mouse down to start potentially dragging
  const handleMouseDown = (e) => {
    // Only allow dragging on the title box
    if (!e.target.closest(".drag-handle")) return;

    e.preventDefault();
    e.stopPropagation();

    // Record the initial position where mouse was pressed
    mouseDownPos.current = { x: e.clientX, y: e.clientY };

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setOriginalPosition({
      x: movie.startTime,
      y: movie.screen,
    });

    // Mark that we've detected a mouse down
    setDragStarted(true);
  };

  // Handle mouse move during dragging
  const handleMouseMove = (e) => {
    if (!dragStarted) return;

    // Only start actual dragging if mouse has moved more than 5px from initial position
    // This prevents accidental drags when user just wants to click
    if (!isDragging) {
      const dx = Math.abs(e.clientX - mouseDownPos.current.x);
      const dy = Math.abs(e.clientY - mouseDownPos.current.y);

      if (dx > 5 || dy > 5) {
        setIsDragging(true);
      } else {
        return;
      }
    }

    e.preventDefault();

    if (!timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();

    // Calculate new position
    const x = e.clientX - timelineRect.left - dragOffset.x;
    const y = e.clientY - timelineRect.top;

    // Calculate new time and screen based on position
    const newTime = x / scale.x + xDomain[0];
    const newScreen = Math.floor(y / rowHeight);

    // Constrain to valid values
    const duration = movie.endTime - movie.startTime;
    const constrainedTime = Math.max(0, Math.min(24 - duration, newTime));
    const constrainedScreen = Math.max(
      0,
      Math.min(screens.length - 1, newScreen)
    );

    setDragPosition({
      x: constrainedTime,
      y: constrainedScreen,
    });
  };

  // Handle mouse up to end dragging or process click
  const handleMouseUp = (e) => {
    if (dragStarted) {
      e.stopPropagation(); // Prevent timeline click handling

      if (isDragging) {
        // End dragging and update position
        setIsDragging(false);
        setDragStarted(false);

        // Calculate final position - rounded to nearest 5 minutes (0.0833 hours)
        const roundTo = 5 / 60; // 5 minutes in hours
        const newStartTime = Math.round(dragPosition.x / roundTo) * roundTo;
        const duration = movie.endTime - movie.startTime;
        const newEndTime = newStartTime + duration;
        const newScreen = dragPosition.y;

        // Only update if position actually changed
        if (
          Math.abs(newStartTime - originalPosition.x) > 0.001 ||
          newScreen !== originalPosition.y
        ) {
          onDragEnd(movie.id, newStartTime, newEndTime, newScreen);
        }
      } else {
        // If we never actually started dragging, this is a click
        setDragStarted(false);
        onClick(movie);
      }
    }
  };

  // Handle click on the title box specifically
  const handleTitleClick = (e) => {
    // Only process clicks, not drags
    if (!isDragging && !dragStarted) {
      e.stopPropagation();
      onClick(movie);
    }
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (dragStarted) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragStarted,
    isDragging,
    dragOffset,
    originalPosition,
    dragPosition,
    scale,
    xDomain,
  ]);

  // Calculate displayed position (original or drag position)
  const displayLeft = isDragging
    ? (dragPosition.x - xDomain[0]) * scale.x
    : left;

  const displayTop = isDragging
    ? dragPosition.y * rowHeight
    : movie.screen * rowHeight;

  // Calculate movie end time without interval for display
  const movieEndTime = isDragging
    ? dragPosition.x + movieDuration
    : movie.startTime + movieDuration;

  // Calculate interval end time
  const intervalEndTime = isDragging
    ? dragPosition.x + movieDuration + intervalDuration
    : movie.startTime + movieDuration + intervalDuration;

  // Format time for tooltip
  const tooltipTitle = `${movie.title}
Movie: ${formatTime(
    isDragging ? dragPosition.x : movie.startTime
  )} - ${formatTime(movieEndTime)}
${
  movie.intervalTime
    ? `Interval: ${formatTime(movieEndTime)} - ${formatTime(intervalEndTime)}`
    : ""
}
Total: ${formatTime(
    isDragging ? dragPosition.x : movie.startTime
  )} - ${formatTime(
    isDragging
      ? dragPosition.x + (movie.endTime - movie.startTime)
      : movie.endTime
  )}
Screen: ${screens[isDragging ? dragPosition.y : movie.screen]}`;

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <div
        className={`absolute transition-shadow movie-slot ${
          isDragging ? "shadow-lg z-50" : "z-10"
        }`}
        style={{
          top: displayTop,
          left: `${displayLeft}px`,
          width: `${width}px`,
          height: rowHeight,
          opacity: isDragging ? 0.8 : 1,
          cursor: isDragging ? "grabbing" : "pointer",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Horizontal line connecting start to end */}
        <div
          className={`absolute ${lineWidth}-t ${lineColor} w-full`}
          style={{
            top: "50%",
          }}
        />

        {/* Vertical line at start time */}
        <div
          className={`absolute ${lineWidth}-l ${lineColor}`}
          style={{
            left: 0,
            top: "35%",
            height: "30%",
          }}
        />

        {/* Movie title label */}
        <div
          className={`absolute ${bgColor} px-2 py-1 rounded-md shadow-sm ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } hover:shadow-md transition-shadow ${
            isSelected ? `border-2 ${lineColor}` : `border ${lineColor}`
          } drag-handle`}
          style={{
            left: width / 2,
            top: "25%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            whiteSpace: "nowrap",
            maxWidth: "180px", // Prevent extra long titles
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={handleTitleClick}
          onMouseDown={(e) => {
            // Prevent drag from happening when user clicks inside title box
            e.stopPropagation();
            handleMouseDown(e);
          }}
        >
          <span className="text-xs font-medium truncate block">
            {movie.title}
          </span>
          <span className="text-xs text-gray-500 block">
            {formatTime(isDragging ? dragPosition.x : movie.startTime)} -{" "}
            {formatTime(
              isDragging
                ? dragPosition.x + (movie.endTime - movie.startTime)
                : movie.endTime
            )}
          </span>
        </div>

        {/* Vertical line at end time */}
        <div
          className={`absolute ${lineWidth}-l ${lineColor}`}
          style={{
            right: 0,
            top: "35%",
            height: "30%",
          }}
        />
      </div>
    </Tooltip>
  );
};
