import React, { useRef, useState, useEffect } from "react";
import { Tooltip } from "antd";

// TimelineGrid component responsible for displaying the grid and handling mouse interactions
const TimelineGrid = ({
  screens,
  xDomain,
  scale,
  timeLabels,
  visibleWidth,
  rowHeight,
  formatTime,
  onTimelineClick,
  scheduledMovies,
  onMovieClick,
  selectedMovie,
  onMovieDragEnd,
}) => {
  const timelineRef = useRef(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Track mouse position for timeline hover effects
  const handleTimelineMouseMove = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate time and screen
      const hoverTime = x / scale.x + xDomain[0];
      const hoverScreen = Math.floor((y / rect.height) * screens.length);

      // Round to nearest 5 minutes for better readability
      const roundTo = 5 / 60; // 5 minutes in hours
      const roundedTime = Math.round(hoverTime / roundTo) * roundTo;

      setHoverPosition({
        time: roundedTime,
        screen: hoverScreen,
        x: x,
        y: y,
      });
    }
  };

  // Handle timeline mouse leave
  const handleTimelineMouseLeave = () => {
    setHoverPosition(null);
  };

  // Check if a movie is visible in the current domain
  const isMovieVisible = (movie) => {
    return (
      (movie.startTime >= xDomain[0] && movie.startTime <= xDomain[1]) || // Start time visible
      (movie.endTime > xDomain[0] && movie.endTime <= xDomain[1]) || // End time visible
      (movie.startTime <= xDomain[0] && movie.endTime > xDomain[1]) // Movie spans entire visible area
    );
  };

  return (
    <div
      className="absolute left-24 top-12 right-0 bottom-0 overflow-auto"
      style={{ width: "calc(100% - 24px)" }}
    >
      <div
        ref={timelineRef}
        style={{
          width: `${visibleWidth}px`,
          height: screens.length * rowHeight,
          position: "relative",
        }}
        onClick={onTimelineClick}
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
      >
        {/* Complete time grid lines */}
        {timeLabels.map((label, index) => (
          <div
            key={`grid-${index}`}
            className={`absolute h-full ${
              label.isHour
                ? "border-l border-gray-300"
                : label.isMinor
                ? "border-l border-gray-100"
                : "border-l border-gray-200"
            }`}
            style={{
              left: `${label.position}px`,
              zIndex: 1,
            }}
          />
        ))}

        {/* Screen row backgrounds and horizontal grid lines */}
        {screens.map((_, index) => (
          <div
            key={index}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            style={{
              position: "absolute",
              top: index * rowHeight,
              left: 0,
              width: "100%",
              height: rowHeight,
              borderBottom: "1px solid #eee",
              zIndex: 2,
            }}
          />
        ))}

        {/* Mouse cursor crosshair lines */}
        {hoverPosition && (
          <>
            {/* Vertical time guide */}
            <div
              className="absolute border-l border-blue-400"
              style={{
                left: hoverPosition.x,
                top: 0,
                height: "100%",
                zIndex: 10,
              }}
            />

            {/* Horizontal screen guide */}
            <div
              className="absolute border-t border-blue-400"
              style={{
                left: 0,
                width: "100%",
                top: Math.floor(
                  hoverPosition.screen * rowHeight + rowHeight / 2
                ),
                zIndex: 10,
              }}
            />

            {/* Position indicator tooltip */}
            <div
              className="absolute bg-blue-100 px-2 py-1 rounded-md shadow-sm text-xs z-20 border border-blue-400"
              style={{
                left: hoverPosition.x + 10,
                top: hoverPosition.y - 30,
                pointerEvents: "none",
              }}
            >
              Time: {formatTime(hoverPosition.time)}
              <br />
              Screen: {screens[hoverPosition.screen]}
            </div>
          </>
        )}

        {/* Movie time slots */}
        {scheduledMovies.filter(isMovieVisible).map((movie) => (
          <MovieSlot
            key={movie.id}
            movie={movie}
            formatTime={formatTime}
            screens={screens}
            onClick={onMovieClick}
            scale={scale}
            isSelected={selectedMovie && selectedMovie.id === movie.id}
            onDragEnd={onMovieDragEnd}
            timelineRef={timelineRef}
            xDomain={xDomain}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineGrid;
