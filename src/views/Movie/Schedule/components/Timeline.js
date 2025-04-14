import React, { useRef, useState, useEffect } from "react";
import { MovieSlot } from "./MovieSlot";
import { Button, Tooltip } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";

const Timeline = ({
  screens,
  scheduledMovies,
  selectedMovie,
  xDomain: propXDomain,
  scale: propScale,
  visibleWidth: propVisibleWidth,
  rowHeight,
  formatTime,
  handleTimelineClick,
  handleTimelineMouseMove,
  handleTimelineMouseLeave,
  handleMovieClick,
  handleMovieDragEnd,
  tooltipInfo,
  isMovieVisible,
}) => {
  const timelineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const headerScrollContainerRef = useRef(null);
  const [xDomain, setXDomain] = useState(propXDomain || [0, 24]);
  const [scale, setScale] = useState(propScale || { x: 80 });
  const [visibleWidth, setVisibleWidth] = useState(propVisibleWidth || 1920);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [scrollStart, setScrollStart] = useState(null);

  // Update local state when props change
  useEffect(() => {
    if (propXDomain) setXDomain(propXDomain);
  }, [propXDomain]);

  useEffect(() => {
    if (propScale) setScale(propScale);
  }, [propScale]);

  useEffect(() => {
    if (propVisibleWidth) setVisibleWidth(propVisibleWidth);
  }, [propVisibleWidth]);

  // Calculate total timeline width based on scale and domain
  const totalWidth = (xDomain[1] - xDomain[0]) * scale.x;

  // Generate time labels - ensure they're visible by adding more granularity
  const generateTimeLabels = () => {
    const labels = [];
    const hourStep = scale.x > 100 ? 0.5 : 1; // Show half-hour markers if zoomed in

    // Add hour markers (every hour or half-hour from 0 to 24)
    for (
      let hour = Math.floor(xDomain[0]);
      hour <= Math.ceil(xDomain[1]);
      hour += hourStep
    ) {
      if (hour >= 0 && hour <= 24) {
        labels.push({
          time: hour,
          position: (hour - xDomain[0]) * scale.x,
          isHour: Number.isInteger(hour),
        });
      }
    }

    return labels;
  };

  // Enable dragging the timeline
  const handleTimelineMouseDown = (e) => {
    // Only start dragging if we click on the background, not on movies or controls
    if (
      e.target.closest(".movie-slot") ||
      e.target.closest(".drag-handle") ||
      e.target.closest("button")
    ) {
      return;
    }

    setIsDraggingTimeline(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    if (scrollContainerRef.current) {
      setScrollStart({
        left: scrollContainerRef.current.scrollLeft,
        top: scrollContainerRef.current.scrollTop,
      });
    }

    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (
      isDraggingTimeline &&
      dragStart &&
      scrollStart &&
      scrollContainerRef.current
    ) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      scrollContainerRef.current.scrollLeft = scrollStart.left - dx;
      scrollContainerRef.current.scrollTop = scrollStart.top - dy;

      // Sync header scroll
      if (headerScrollContainerRef.current) {
        headerScrollContainerRef.current.scrollLeft =
          scrollContainerRef.current.scrollLeft;
      }

      e.preventDefault();
    } else if (handleTimelineMouseMove) {
      // Call the original mouse move handler for movie tooltips
      handleTimelineMouseMove(e, timelineRef);
    }
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingTimeline(false);
  };

  useEffect(() => {
    if (isDraggingTimeline) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleTimelineMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleTimelineMouseUp);
    };
  }, [isDraggingTimeline, dragStart, scrollStart]);

  // Synchronize scrolling between header and content
  const syncScroll = (e) => {
    if (
      e.currentTarget === scrollContainerRef.current &&
      headerScrollContainerRef.current
    ) {
      headerScrollContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    } else if (
      e.currentTarget === headerScrollContainerRef.current &&
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Emit changes to parent component when local state changes
  useEffect(() => {
    // Emit xDomain changes to parent component
    if (JSON.stringify(xDomain) !== JSON.stringify(propXDomain)) {
      const onXDomainChangeEvent = new CustomEvent("xDomainChange", {
        detail: xDomain,
      });
      window.dispatchEvent(onXDomainChangeEvent);
    }

    // Emit scale changes to parent component
    if (JSON.stringify(scale) !== JSON.stringify(propScale)) {
      const onScaleChangeEvent = new CustomEvent("scaleChange", {
        detail: scale,
      });
      window.dispatchEvent(onScaleChangeEvent);
    }
  }, [xDomain, scale, propXDomain, propScale]);

  return (
    <div
      className="border rounded overflow-hidden relative"
      style={{ height: Math.max(500, screens.length * rowHeight + 40) }}
    >
      <div className="absolute top-12 left-0 bottom-0 w-24 bg-gray-100 border-r z-10 overflow-y-auto">
        {screens.map((screen, index) => (
          <div
            key={index}
            className="absolute left-0 w-full border-b border-gray-200 flex items-center justify-center text-xs font-medium"
            style={{
              top: index * rowHeight,
              height: rowHeight,
            }}
          >
            <div className="p-2 truncate max-w-full">{screen}</div>
          </div>
        ))}
      </div>

      <div
        ref={headerScrollContainerRef}
        className="absolute top-0 left-24 right-0 h-12 bg-gray-100 border-b z-10 overflow-x-auto"
        onScroll={syncScroll}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${totalWidth}px` }}
        >
          {generateTimeLabels().map((label, index) => (
            <div
              key={index}
              className={`absolute h-full ${
                label.isHour
                  ? "border-l border-gray-300"
                  : "border-l border-gray-200"
              }`}
              style={{
                left: `${label.position}px`,
              }}
            >
              {label.isHour && (
                <div className="px-1 py-2 text-xs whitespace-nowrap">
                  {Math.floor(label.time) === label.time
                    ? `${(label.time % 12 || 12)
                        .toString()
                        .padStart(2, "0")}:00 ${label.time >= 12 ? "PM" : "AM"}`
                    : `${(Math.floor(label.time) % 12 || 12)
                        .toString()
                        .padStart(2, "0")}:30 ${
                        Math.floor(label.time) >= 12 ? "PM" : "AM"
                      }`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline grid with content - Now with synchronized scrolling */}
      <div
        ref={scrollContainerRef}
        className="absolute left-24 top-12 right-0 bottom-0 overflow-auto"
        style={{ width: "calc(100% - 24px)" }}
        onScroll={syncScroll}
      >
        <div
          ref={timelineRef}
          style={{
            width: `${totalWidth}px`,
            height: screens.length * rowHeight,
            position: "relative",
            cursor: isDraggingTimeline ? "grabbing" : "grab",
          }}
          onClick={handleTimelineClick}
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={(e) =>
            !isDraggingTimeline && handleTimelineMouseMove(e, timelineRef)
          }
          onMouseLeave={handleTimelineMouseLeave}
        >
          {/* Background grid */}
          <div className="absolute inset-0">
            {/* Vertical time grid lines */}
            {generateTimeLabels().map((label, index) => (
              <div
                key={`grid-${index}`}
                className={`absolute h-full ${
                  label.isHour
                    ? "border-l border-gray-300"
                    : "border-l border-gray-200"
                }`}
                style={{
                  left: `${label.position}px`,
                  zIndex: 1,
                }}
              />
            ))}

            {/* Screen row backgrounds with horizontal grid lines */}
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
                  borderBottom: "1px solid #e0e0e0",
                  zIndex: 2,
                }}
              />
            ))}
          </div>

          {/* Movie time slots */}
          {scheduledMovies
            .filter((movie) => isMovieVisible(movie, xDomain))
            .map((movie) => (
              <MovieSlot
                key={movie.id}
                movie={movie}
                formatTime={formatTime}
                screens={screens}
                onClick={handleMovieClick}
                scale={scale}
                isSelected={selectedMovie && selectedMovie.id === movie.id}
                onDragEnd={handleMovieDragEnd}
                timelineRef={timelineRef}
                xDomain={xDomain}
                rowHeight={rowHeight}
              />
            ))}

          {/* Timeline tooltip */}
          {tooltipInfo && (
            <div
              className="absolute bg-white shadow-md p-2 rounded-md text-xs z-50 border border-gray-200"
              style={{
                left: tooltipInfo.x,
                top: tooltipInfo.y,
                transform: "translate(0, -50%)",
                pointerEvents: "none",
              }}
            >
              <div className="font-medium">{tooltipInfo.screen}</div>
              <div>{tooltipInfo.time}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
