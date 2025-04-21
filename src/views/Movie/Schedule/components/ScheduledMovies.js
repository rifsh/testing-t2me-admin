import React from "react";
import { InfoOutlined } from "@ant-design/icons";

export default function ScheduledMovies({
  scheduledMovies,
  activeTab,
  movies,
  screens,
  rowHeight,
  hourWidth,
  sidebarWidth,
  handleScheduledMovieClick,
  handleScheduledMovieDragStart,
}) {
  const currentTabMovies = scheduledMovies[activeTab] || [];

  return currentTabMovies.map((scheduledMovie) => {
    const movie = movies.find((m) => m.id === scheduledMovie.movieId);
    if (!movie) return null;

    const screenIndex = screens.findIndex(
      (screen) => screen.id === scheduledMovie.screen.id
    );
    if (screenIndex === -1) return null;

    const top = screenIndex * rowHeight;
    const left = (scheduledMovie.startMinutes / 60) * hourWidth;

    let displayWidth;

    if (scheduledMovie.isMidnightPassed) {
      const minutesToMidnight = 24 * 60 - scheduledMovie.startMinutes;

      const effectiveMinutes = Math.min(
        minutesToMidnight,
        // scheduledMovie.actualDuration ||
        //   scheduledMovie.originalDuration ||
          scheduledMovie.endMinutes - scheduledMovie.startMinutes
      );

      displayWidth = (effectiveMinutes / 60) * hourWidth;
    } else if (scheduledMovie.isContinuation) {
      displayWidth = (scheduledMovie.endMinutes / 60) * hourWidth;
    } else {
      displayWidth =
        ((scheduledMovie.endMinutes - scheduledMovie.startMinutes) / 60) *
        hourWidth;
    }

    const startHour = Math.floor(scheduledMovie.startMinutes / 60);
    const startMinute = scheduledMovie.startMinutes % 60;
    const endHour = Math.floor(scheduledMovie.endMinutes / 60);
    const endMinute = scheduledMovie.endMinutes % 60;

    const startTimeFormatted = `${startHour
      .toString()
      .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
    const endTimeFormatted = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    const cardMaxWidth = 180;
    const cardWidth = Math.min(displayWidth, cardMaxWidth);

    const fullDuration =
      scheduledMovie.actualDuration ||
      scheduledMovie.originalDuration ||
      scheduledMovie.endMinutes - scheduledMovie.startMinutes;

    const fullDurationHours = Math.floor(fullDuration / 60);
    const fullDurationMinutes = fullDuration % 60;
    const fullDurationText = `${fullDurationHours}h ${fullDurationMinutes}m`;

    return (
      <div
        key={scheduledMovie.id}
        className="absolute"
        style={{
          top: `${top + rowHeight / 2 - 10}px`,
          left: `${left + sidebarWidth}px`,
          width: `${displayWidth}px`, 
          height: `${20}px`,
        }}
      >
        <div
          className="absolute h-1 rounded-full w-full top-1/2 transform -translate-y-1/2"
          style={{
            backgroundColor: movie.color || "#1890ff",
            opacity: scheduledMovie.isContinuation ? 0.7 : 1,
          }}
          title={
            scheduledMovie.isMidnightPassed || scheduledMovie.isContinuation
              ? `Full duration: ${fullDurationText}`
              : undefined
          }
        />

        <div
          className="absolute top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-md flex items-center p-1 cursor-pointer z-10"
          style={{
            maxWidth: cardWidth + "px",
            left: `${(displayWidth - cardWidth) / 2}px`, 
            borderLeft: scheduledMovie.isContinuation
              ? `3px solid ${movie.color || "#1890ff"}`
              : "none",
          }}
          onClick={(e) => handleScheduledMovieClick(e, scheduledMovie)}
          draggable
          onDragStart={(e) => handleScheduledMovieDragStart(e, scheduledMovie)}
        >
          {movie.image && (
            <img
              src={movie.image}
              alt={movie.title}
              className="h-6 w-6 rounded-full object-cover mr-1.5 flex-shrink-0"
            />
          )}
          <div className="flex-grow overflow-hidden">
            <div className="font-medium text-xs truncate">
              {scheduledMovie.isContinuation && "↪ "}
              {movie.title}
            </div>
            <div className="text-xs text-gray-500">
              {startTimeFormatted} - {endTimeFormatted}
              {scheduledMovie.isMidnightPassed && " ↪"}
            </div>
          </div>
          <div className="ml-1 flex-shrink-0 text-gray-500">
            <InfoOutlined style={{ fontSize: "12px" }} />
          </div>
        </div>
      </div>
    );
  });
}
