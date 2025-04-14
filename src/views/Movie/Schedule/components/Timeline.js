import React, { useRef } from 'react';
import { MovieSlot } from './MovieSlot';

const Timeline = ({
  screens,
  scheduledMovies,
  selectedMovie,
  xDomain,
  scale,
  visibleWidth,
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

  // Generate time labels
  const generateTimeLabels = () => {
    const labels = [];
    
    // Add hour markers (every hour from 0 to 24)
    for (let hour = 0; hour <= 24; hour++) {
      labels.push({
        time: hour,
        position: (hour - xDomain[0]) * scale.x,
        isHour: true,
      });
    }

    return labels;
  };

  return (
    <div className="border rounded overflow-hidden relative" style={{ height: Math.max(500, screens.length * rowHeight + 40) }}>
      {/* Screen names on the left */}
      <div className="absolute top-12 left-0 bottom-0 w-24 bg-gray-100 border-r z-10">
        {screens.map((screen, index) => (
          <div
            key={index}
            className="absolute left-0 w-full border-b border-gray-200 flex items-center justify-center text-xs font-medium"
            style={{
              top: index * rowHeight,
              height: rowHeight,
            }}
          >
            {screen}
          </div>
        ))}
      </div>

      {/* Time headers */}
      <div className="absolute top-0 left-24 right-0 h-12 bg-gray-100 border-b z-10 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${visibleWidth}px` }}
        >
          {generateTimeLabels().map((label, index) => (
            <div
              key={index}
              className="absolute h-full border-l border-gray-300 font-medium"
              style={{
                left: `${label.position}px`,
              }}
            >
              <div className="px-1 py-2">
                {label.time.toString().padStart(2, '0')}:00
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline grid with content */}
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
          onClick={handleTimelineClick}
          onMouseMove={(e) => handleTimelineMouseMove(e, timelineRef)}
          onMouseLeave={handleTimelineMouseLeave}
        >
          {/* Time grid lines */}
          {generateTimeLabels().map((label, index) => (
            <div
              key={`grid-${index}`}
              className="absolute h-full border-l border-gray-300"
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

          {/* Movie time slots */}
          {scheduledMovies.filter(isMovieVisible).map((movie) => (
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