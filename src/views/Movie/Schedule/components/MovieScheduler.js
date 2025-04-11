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
} from "store/slices/movieScheduleSlice";
import Header from "./Header";

const { Header: AntHeader, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced MovieSlot component - now horizontal
const MovieSlot = ({
  movie,
  formatTime,
  screens,
  onClick,
  scale,
  isSelected,
}) => {
  // Calculate position and size based on movie time and duration
  const left = (movie.startTime - movie.xDomain[0]) * scale.x;
  const width = Math.max(30, (movie.endTime - movie.startTime) * scale.x); // Ensure minimum width

  // Line color based on selection status
  const lineColor = isSelected ? "border-green-500" : "border-indigo-400";
  const lineWidth = isSelected ? "border-2" : "border";
  const bgColor = isSelected ? "bg-green-50" : "bg-white";

  return (
    <div
      className="absolute"
      style={{
        top: 0,
        bottom: 0,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: isSelected ? 10 : 1, // Bring selected items to front
      }}
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
                    }`}
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
        onClick={() => onClick(movie)}
        title={`${movie.title} (${formatTime(movie.startTime)} - ${formatTime(
          movie.endTime
        )})`}
      >
        <span className="text-xs font-medium truncate block">
          {movie.title}
        </span>
        <span className="text-xs text-gray-500 block">
          {formatTime(movie.startTime)} - {formatTime(movie.endTime)}
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
    if (e.target.closest(".cursor-pointer")) {
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
      dispatch(setSelectedMovie({ ...movie, ...fullMovie }));
      setIsDetailsVisible(true);
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
    } else {
      stepSize = 1; // 1 hour for default/zoomed out view
    }

    // Start from the first hour mark in our domain and go to the end
    const startHour = Math.floor(xDomain[0]);
    for (let time = startHour; time <= xDomain[1]; time += stepSize) {
      labels.push({
        time,
        position: (time - xDomain[0]) * scale.x,
        isHour: Number.isInteger(time),
        isMinor: false,
      });
    }

    // Add intermediate minute markers when zoomed in
    if (zoomLevel >= 1.5 && stepSize < 1) {
      for (let time = startHour; time <= xDomain[1]; time += stepSize / 2) {
        // Only add if it's not already an hour or other major mark
        if (!labels.some((label) => Math.abs(label.time - time) < 0.001)) {
          labels.push({
            time,
            position: (time - xDomain[0]) * scale.x,
            isHour: false,
            isMinor: true,
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
    const panAmount = 1 / zoomLevel;
    if (direction === "left") {
      dispatch(
        setXDomain([
          Math.max(0, xDomain[0] - panAmount),
          Math.max(xDomain[1] - panAmount, xDomain[1] - xDomain[0]),
        ])
      );
    } else {
      dispatch(
        setXDomain([
          Math.min(xDomain[0] + panAmount, 24 - (xDomain[1] - xDomain[0])),
          Math.min(24, xDomain[1] + panAmount),
        ])
      );
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
      movieId: selectedMovieId,
      screen: selectedScreen,
      startTime,
      endTime,
      title: movie.title,
      image: movie.image,
      director: movie.director,
      genre: movie.genre,
      duration: movie.duration,
      xDomain,
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
    // Calculate width based on time domain and scale
    const domainWidth = (xDomain[1] - xDomain[0]) * scale.x;

    // Return the larger of the two to ensure content is visible
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
                  Click on timeline to schedule • Click on movie labels for
                  details
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
                          {label.isHour
                            ? formatTime(label.time)
                            : formatTime(label.time).split(":")[1] === "00"
                            ? formatTime(label.time).split(":")[0]
                            : formatTime(label.time)}
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
                    <div
                      key={movie.id}
                      style={{
                        position: "absolute",
                        top: movie.screen * rowHeight,
                        height: rowHeight,
                        zIndex: 10,
                      }}
                    >
                      <MovieSlot
                        movie={{ ...movie, xDomain }}
                        formatTime={formatTime}
                        screens={screens}
                        onClick={handleMovieClick}
                        scale={scale}
                        isSelected={
                          selectedMovie && selectedMovie.id === movie.id
                        }
                      />
                    </div>
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
