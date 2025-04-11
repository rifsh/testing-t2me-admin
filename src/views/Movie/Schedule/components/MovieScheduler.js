import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ClockCircleOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Button,
  Typography,
  Space,
  message,
  Modal,
  Select,
  TimePicker,
  Drawer,
  Card,
} from "antd";
import dayjs from "dayjs";

import MovieDetails from "./MovieDetails";
import MovieList from "./MovieList";
import {
  setSelectedMovie,
  setZoomLevel,
  setXDomain,
  addScheduledMovie,
  removeScheduledMovie,
  updateScheduledMovie,
} from "store/slices/movieScheduleSlice";
import Header from "./Header";

const { Header: AntHeader, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced MovieSlot component with drag functionality
const MovieSlot = ({
  movie,
  formatTime,
  screens,
  onClick,
  scale,
  isSelected,
  onDragEnd,
  timelineRef,
  xDomain,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Calculate position and size based on movie time and duration
  const left = (movie.startTime - xDomain[0]) * scale.x;
  const width = Math.max(30, (movie.endTime - movie.startTime) * scale.x); // Ensure minimum width

  // Line color based on selection and drag status
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

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    // Only allow dragging on the movie title box, not the entire area
    if (!e.target.closest(".drag-handle")) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginalPosition({
      x: movie.startTime,
      y: movie.screen,
    });
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse move during dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const rowHeight = timelineRect.height / screens.length;

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

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Calculate final position
    const newStartTime = dragPosition.x;
    const newEndTime = newStartTime + (movie.endTime - movie.startTime);
    const newScreen = dragPosition.y;

    // Only update if position actually changed
    if (
      newStartTime !== originalPosition.x ||
      newScreen !== originalPosition.y
    ) {
      onDragEnd(movie.id, newStartTime, newEndTime, newScreen);
    }
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, originalPosition]);

  // Calculate displayed position (original or drag position)
  const displayLeft = isDragging
    ? (dragPosition.x - xDomain[0]) * scale.x
    : left;

  const displayTop = isDragging
    ? dragPosition.y *
      (timelineRef.current?.getBoundingClientRect().height / screens.length ||
        0)
    : movie.screen *
      (timelineRef.current?.getBoundingClientRect().height / screens.length ||
        0);

  return (
    <div
      className={`absolute transition-shadow ${
        isDragging ? "shadow-lg z-50" : "z-10"
      }`}
      style={{
        top: displayTop,
        left: `${displayLeft}px`,
        width: `${width}px`,
        height:
          timelineRef.current?.getBoundingClientRect().height /
            screens.length || 0,
        opacity: isDragging ? 0.8 : 1,
        cursor: isDragging ? "grabbing" : "grab",
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
        className={`absolute ${bgColor} px-2 py-1 rounded-md shadow-sm cursor-pointer 
                    hover:shadow-md transition-shadow ${
                      isSelected
                        ? `border-2 ${lineColor}`
                        : `border ${lineColor}`
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
        onClick={(e) => {
          if (!isDragging) onClick(movie);
          e.stopPropagation();
        }}
        title={`${movie.title} (${formatTime(movie.startTime)} - ${formatTime(
          movie.endTime
        )}) - Drag to reschedule`}
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
  );
};

// Main App Component
export default function MovieScheduler() {
  const dispatch = useDispatch();
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [scale, setScale] = useState({ x: 40 }); // pixels per hour
  const [containerWidth, setContainerWidth] = useState(0);

  // Get state from Redux store
  const movies = useSelector((state) => state.movieScheduleSlice.movies);
  const scheduledMovies = useSelector(
    (state) => state.movieScheduleSlice.scheduledMovies
  );
  const selectedMovie = useSelector(
    (state) => state.movieScheduleSlice.selectedMovie
  );
  const zoomLevel = useSelector((state) => state.movieScheduleSlice.zoomLevel);
  const xDomain = useSelector(
    (state) => state.movieScheduleSlice.xDomain || [0, 24]
  );

  const screens = ["Screen 1", "Screen 2", "Screen 3", "Screen 4", "Screen 5"];

  // Update container width on mount and resize
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 24);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Set initial full view on component mount
  useEffect(() => {
    // Ensure we start with full day view
    dispatch(setXDomain([0, 24]));

    // Calculate initial scale based on container width
    if (containerRef.current) {
      const width = containerRef.current.clientWidth - 48;
      const initialZoom = width / (24 * 40); // Base scale is 40px per hour
      dispatch(setZoomLevel(Math.min(Math.max(initialZoom, 0.5), 3)));
    }
  }, []); // Empty dependency array means this runs once on mount

  // Update scale when zoom level changes
  useEffect(() => {
    setScale({ x: 40 * zoomLevel });
  }, [zoomLevel]);

  // Convert 24-hour time to a dayjs object
  const timeToDate = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return dayjs().hour(hours).minute(minutes).second(0);
  };

  // Convert dayjs to 24-hour decimal time
  const dateToTime = (date) => {
    if (!date) return null;
    return date.hour() + date.minute() / 60;
  };

  // Format time for display (24-hour format with minutes)
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format time for display based on zoom level
  const formatTimeByZoom = (time, isHour) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    // If zoomed out and not an hour mark, just show the hour
    if (zoomLevel < 1.5 && !isHour) {
      return hours.toString().padStart(2, "0");
    }

    // If it's an hour mark or zoomed in enough, show full time
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if a movie is visible in the current domain
  const isMovieVisible = (movie) => {
    // Movie is visible if any part of it is in the current domain
    return (
      (movie.startTime >= xDomain[0] && movie.startTime <= xDomain[1]) || // Start time visible
      (movie.endTime > xDomain[0] && movie.endTime <= xDomain[1]) || // End time visible
      (movie.startTime <= xDomain[0] && movie.endTime > xDomain[1]) // Movie spans entire visible area
    );
  };

  // Handle timeline click to schedule new movie
  const handleTimelineClick = (e) => {
    // Ignore clicks on movie slots or labels
    if (
      e.target.closest(".cursor-pointer") ||
      e.target.closest(".drag-handle")
    ) {
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the screen and time from pixel position
    const screenIndex = Math.floor((y / rect.height) * screens.length);
    const xTime = x / scale.x + xDomain[0];

    // Validate clicked area
    if (
      screenIndex >= 0 &&
      screenIndex < screens.length &&
      xTime >= 0 &&
      xTime <= 24
    ) {
      setSelectedScreen(screenIndex);
      setSelectedTime(timeToDate(xTime));
      setIsModalVisible(true);
    }
  };

  // Handle movie slot click
  const handleMovieClick = (movie) => {
    const fullMovie = movies.find((m) => m.id === movie.movieId);
    if (fullMovie) {
      // Combine scheduled movie info with full movie details
      const completeMovieInfo = {
        ...movie,
        genre: fullMovie.genre,
        director: fullMovie.director,
        image: fullMovie.image,
        duration: fullMovie.duration,
      };
      dispatch(setSelectedMovie(completeMovieInfo));
      setIsDetailsVisible(true);
    }
  };

  // Handle drag end for movie rescheduling
  const handleMovieDragEnd = (movieId, newStartTime, newEndTime, newScreen) => {
    // Find the movie
    const movie = scheduledMovies.find((m) => m.id === movieId);
    if (!movie) return;

    // Check for overlapping movies
    const isOverlapping = scheduledMovies.some(
      (m) =>
        m.id !== movieId && // Don't compare with self
        m.screen === newScreen && // Same screen
        ((newStartTime >= m.startTime && newStartTime < m.endTime) || // Start time overlaps
          (newEndTime > m.startTime && newEndTime <= m.endTime) || // End time overlaps
          (newStartTime <= m.startTime && newEndTime >= m.endTime)) // Fully contains other movie
    );

    if (isOverlapping) {
      message.error("Cannot reschedule: Time slot overlaps with another movie");
      return;
    }

    // Create updated movie object keeping all original properties
    const updatedMovie = {
      ...movie,
      startTime: newStartTime,
      endTime: newEndTime,
      screen: newScreen,
    };

    // Update the movie with new scheduling
    dispatch(updateScheduledMovie(updatedMovie));

    message.success(`"${movie.title}" rescheduled successfully`);

    // Update selected movie if it's the one being dragged
    if (selectedMovie && selectedMovie.id === movieId) {
      dispatch(setSelectedMovie(updatedMovie));
    }
  };

  // Handle movie selection from the movie list
  const handleMovieSelect = (movie) => {
    setSelectedMovieId(movie.id);
    setIsModalVisible(true);
  };

  // Generate time labels based on zoom level
  const generateTimeLabels = () => {
    const labels = [];
    const domainWidth = xDomain[1] - xDomain[0];

    // Determine step size based on zoom level
    let stepSize;
    if (zoomLevel >= 2) {
      stepSize = 0.25; // 15 minutes when zoomed in a lot
    } else if (zoomLevel >= 1.5) {
      stepSize = 0.5; // 30 minutes when zoomed in moderately
    } else if (zoomLevel >= 1) {
      stepSize = 1; // 1 hour for normal zoom
    } else {
      stepSize = 2; // 2 hours for zoomed out
    }

    // Start from the first hour mark in our domain and go to the end
    const startHour = Math.ceil(xDomain[0]);
    const endHour = Math.floor(xDomain[1]);

    // Add hour markers
    for (let time = startHour; time <= endHour; time += 1) {
      labels.push({
        time,
        position: (time - xDomain[0]) * scale.x,
        isHour: true,
        isMinor: false,
      });
    }

    // Add minute markers based on zoom level
    if (zoomLevel >= 1) {
      // For normal and zoomed in views
      for (let time = xDomain[0]; time <= xDomain[1]; time += stepSize) {
        // Only add if it's not already an hour mark
        if (!Number.isInteger(time)) {
          labels.push({
            time,
            position: (time - xDomain[0]) * scale.x,
            isHour: false,
            isMinor: stepSize < 0.5,
          });
        }
      }
    }

    // Sort by time
    return labels.sort((a, b) => a.time - b.time);
  };

  // Handle zooming
  const handleZoom = (zoomDelta) => {
    const newZoom = Math.min(Math.max(zoomLevel + zoomDelta, 0.5), 3);

    // Calculate focus point (middle of current domain)
    const focusPoint = (xDomain[0] + xDomain[1]) / 2;

    // Calculate new domain width
    const currentWidth = xDomain[1] - xDomain[0];
    const newWidth = (currentWidth * zoomLevel) / newZoom;

    // Calculate new domain limits
    let newMin = Math.max(0, focusPoint - newWidth / 2);
    let newMax = Math.min(24, newMin + newWidth);

    // Adjust if we hit boundaries
    if (newMax === 24) {
      newMin = Math.max(0, newMax - newWidth);
    }
    if (newMin === 0) {
      newMax = Math.min(24, newMin + newWidth);
    }

    dispatch(setXDomain([newMin, newMax]));
    dispatch(setZoomLevel(newZoom));
  };

  // Pan the timeline
  const panTimeline = (direction) => {
    const panAmount = (xDomain[1] - xDomain[0]) * 0.2; // Pan by 20% of visible area

    if (direction === "left") {
      const newMin = Math.max(0, xDomain[0] - panAmount);
      const newMax = Math.min(24, newMin + (xDomain[1] - xDomain[0]));
      dispatch(setXDomain([newMin, newMax]));
    } else {
      const newMax = Math.min(24, xDomain[1] + panAmount);
      const newMin = Math.max(0, newMax - (xDomain[1] - xDomain[0]));
      dispatch(setXDomain([newMin, newMax]));
    }
  };

  // Handle movie selection from modal
  const handleScheduleMovie = () => {
    if (!selectedMovieId || !selectedTime || selectedScreen === null) {
      message.error("Please select a movie, time, and screen");
      return;
    }

    const movie = movies.find((m) => m.id === selectedMovieId);
    if (!movie) {
      message.error("Invalid movie selection");
      return;
    }

    const startTime = dateToTime(selectedTime);
    const endTime = startTime + movie.duration / 60;

    // Check if the end time exceeds the 24-hour limit
    if (endTime > 24) {
      message.error("Cannot schedule movie beyond 24:00");
      return;
    }

    // Check for overlapping movies
    const isOverlapping = scheduledMovies.some(
      (m) =>
        m.screen === selectedScreen &&
        ((startTime >= m.startTime && startTime < m.endTime) ||
          (endTime > m.startTime && endTime <= m.endTime) ||
          (startTime <= m.startTime && endTime >= m.endTime))
    );

    if (isOverlapping) {
      message.error(
        "Cannot schedule movie: Time slot overlaps with another movie"
      );
      return;
    }

    const newScheduledMovie = {
      id: Date.now(),
      movieId: movie.id,
      screen: selectedScreen,
      startTime,
      endTime,
      title: movie.title,
      image: movie.image,
      director: movie.director,
      genre: movie.genre,
      duration: movie.duration,
    };

    dispatch(addScheduledMovie(newScheduledMovie));
    message.success(`"${movie.title}" scheduled successfully`);
    setIsModalVisible(false);
    resetModalFields();
  };

  // Reset modal fields
  const resetModalFields = () => {
    setSelectedMovieId(null);
    setSelectedTime(null);
    setSelectedScreen(null);
  };

  // Close movie details panel
  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
    dispatch(setSelectedMovie(null));
  };

  // Delete scheduled movie
  const deleteScheduledMovie = (id) => {
    dispatch(removeScheduledMovie(id));
    if (selectedMovie && selectedMovie.id === id) {
      setIsDetailsVisible(false);
      dispatch(setSelectedMovie(null));
    }
    message.success("Movie removed from schedule");
  };

  // Calculate the visible width - ensure it fills container
  const calculateVisibleWidth = () => {
    // Calculate width based on domain and scale
    const domainWidth = (xDomain[1] - xDomain[0]) * scale.x;

    // Return the larger of container width or calculated width
    return Math.max(domainWidth, containerWidth || window.innerWidth - 48);
  };

  // Update the visibleWidth calculation
  const visibleWidth = calculateVisibleWidth();

  // Row height for each screen
  const rowHeight = 80;

  return (
    <Layout className="min-h-screen">
      <Header />

      <Layout>
        <Card>
          <Content ref={containerRef}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <Title level={4} className="m-0">
                  Schedule Timeline
                </Title>
                <Text type="secondary">
                  Click on timeline to schedule • Click and drag movies to
                  reschedule • Click on movie labels for details
                </Text>
              </div>
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => panTimeline("left")}
                />
                <Button
                  icon={<ZoomOutOutlined />}
                  onClick={() => handleZoom(-0.25)}
                  disabled={zoomLevel <= 0.5}
                />
                <span>{Math.round(zoomLevel * 100)}%</span>
                <Button
                  icon={<ZoomInOutlined />}
                  onClick={() => handleZoom(0.25)}
                  disabled={zoomLevel >= 3}
                />
                <Button
                  icon={<RightOutlined />}
                  onClick={() => panTimeline("right")}
                />
              </Space>
            </div>

            <div
              className="border rounded overflow-hidden relative"
              style={{ height: Math.max(700, screens.length * rowHeight + 40) }}
            >
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
                >
                  {/* Time grid lines */}
                  {generateTimeLabels().map((label, index) => (
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

                  {/* Screen row backgrounds - alternating colors */}
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

                  {/* Guide line for current selection when scheduling */}
                  {isModalVisible &&
                    selectedScreen !== null &&
                    selectedTime && (
                      <>
                        {/* Horizontal guide line */}
                        <div
                          className="absolute border-t-2 border-blue-400 border-dashed"
                          style={{
                            left: 0,
                            width: "100%",
                            top: selectedScreen * rowHeight + rowHeight / 2,
                            zIndex: 5,
                          }}
                        />
                        {/* Vertical time guide */}
                        <div
                          className="absolute border-l-2 border-blue-400 border-dashed"
                          style={{
                            left:
                              (dateToTime(selectedTime) - xDomain[0]) * scale.x,
                            top: 0,
                            height: "100%",
                            zIndex: 5,
                          }}
                        />
                      </>
                    )}

                  {/* Movie time slots */}
                  {scheduledMovies.filter(isMovieVisible).map((movie) => (
                    <MovieSlot
                      key={movie.id}
                      movie={movie}
                      formatTime={formatTime}
                      screens={screens}
                      onClick={handleMovieClick}
                      scale={scale}
                      isSelected={
                        selectedMovie && selectedMovie.id === movie.id
                      }
                      onDragEnd={handleMovieDragEnd}
                      timelineRef={timelineRef}
                      xDomain={xDomain}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Content>
        </Card>
      </Layout>

      {/* Movie Details Drawer */}
      <Drawer
        title="Movie Details"
        placement="right"
        width={400}
        open={isDetailsVisible && selectedMovie}
        onClose={handleCloseDetails}
        destroyOnClose
      >
        {selectedMovie && (
          <MovieDetails
            movie={selectedMovie}
            formatTime={formatTime}
            screens={screens}
            onClose={handleCloseDetails}
            onDelete={deleteScheduledMovie}
          />
        )}
      </Drawer>

      {/* Modal for scheduling movies */}
      <Modal
        title="Schedule Movie"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetModalFields();
        }}
        onOk={handleScheduleMovie}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <Text strong>Screen:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Select a screen"
              value={selectedScreen !== null ? selectedScreen : undefined}
              onChange={setSelectedScreen}
            >
              {screens.map((screen, index) => (
                <Option key={index} value={index}>
                  {screen}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Start Time:</Text>
            <TimePicker
              style={{ width: "100%", marginTop: 8 }}
              format="HH:mm"
              value={selectedTime}
              onChange={setSelectedTime}
              minuteStep={15}
            />
          </div>

          <div>
            <Text strong>Movie:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Select a movie"
              value={selectedMovieId}
              onChange={setSelectedMovieId}
            >
              {movies.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.title} ({movie.duration} min)
                </Option>
              ))}
            </Select>
          </div>

          {selectedMovieId && (
            <div>
              <Text type="secondary">
                Duration:{" "}
                {movies.find((m) => m.id === selectedMovieId)?.duration} minutes
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </Layout>
  );
}
