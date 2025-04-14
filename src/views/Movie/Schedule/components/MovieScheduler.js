import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  InputNumber,
} from "antd";
import dayjs from "dayjs";
import MovieDetails from "./MovieDetails";
import {
  setSelectedMovie,
  addScheduledMovie,
  removeScheduledMovie,
  updateScheduledMovie,
} from "store/slices/movieScheduleSlice";
import Header from "./Header";
import { MovieSlot } from "./MovieSlot";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

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
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [intervalTime, setIntervalTime] = useState(15); // Default interval time in minutes

  // Get state from Redux store
  const movies = useSelector((state) => state.movieScheduleSlice.movies);
  const scheduledMovies = useSelector(
    (state) => state.movieScheduleSlice.scheduledMovies
  );
  const selectedMovie = useSelector(
    (state) => state.movieScheduleSlice.selectedMovie
  );

  // Fixed 12-hour domain for better visibility (from 0 to 12)
  const xDomain = [0, 12];
  // Scale (pixels per hour)
  const scale = { x: 80 }; // Increased scale for better readability

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
    return (
      (movie.startTime >= xDomain[0] && movie.startTime <= xDomain[1]) || // Start time visible
      (movie.endTime > xDomain[0] && movie.endTime <= xDomain[1]) || // End time visible
      (movie.startTime <= xDomain[0] && movie.endTime > xDomain[1]) // Movie spans entire visible area
    );
  };

  // Improved overlap detection
  const checkOverlap = (
    screen,
    startTime,
    endTime,
    movieIdToExclude = null
  ) => {
    // Get precise epsilon for floating point comparison
    const epsilon = 1e-6;

    return scheduledMovies.some((movie) => {
      // Skip comparison with self when updating
      if (movieIdToExclude !== null && movie.id === movieIdToExclude) {
        return false;
      }

      // Only check overlap if on same screen
      if (movie.screen !== screen) {
        return false;
      }

      // Case 1: New movie starts during existing movie
      const startsInExisting =
        startTime + epsilon >= movie.startTime &&
        startTime - epsilon <= movie.endTime;

      // Case 2: New movie ends during existing movie
      const endsInExisting =
        endTime + epsilon >= movie.startTime &&
        endTime - epsilon <= movie.endTime;

      // Case 3: New movie fully contains existing movie
      const containsExisting =
        startTime - epsilon <= movie.startTime &&
        endTime + epsilon >= movie.endTime;

      return startsInExisting || endsInExisting || containsExisting;
    });
  };

  // Handle mouse move for tooltips
  const handleTimelineMouseMove = (e) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate time and screen from cursor position
    const screenIndex = Math.floor((y / rect.height) * screens.length);
    const xTime = x / scale.x + xDomain[0];

    // Round to nearest 5 minutes
    const roundTo = 5 / 60; // 5 minutes in hours
    const roundedTime = Math.round(xTime / roundTo) * roundTo;

    // Only show tooltip if cursor is within valid area
    if (
      screenIndex >= 0 &&
      screenIndex < screens.length &&
      roundedTime >= 0 &&
      roundedTime <= 24
    ) {
      const tooltipWidth = 120;
      const tooltipHeight = 60;

      // Calculate tooltip position
      let tooltipX = x + 20;
      let tooltipY = y;

      // Adjust tooltip position to stay within bounds
      if (tooltipX + tooltipWidth > rect.width) {
        tooltipX = x - tooltipWidth - 10;
      }
      if (tooltipY + tooltipHeight > rect.height) {
        tooltipY = rect.height - tooltipHeight;
      }
      tooltipY = Math.max(tooltipY, 0);

      setTooltipInfo({
        screen: screens[screenIndex],
        time: formatTime(roundedTime),
        x: tooltipX,
        y: tooltipY,
      });
    } else {
      setTooltipInfo(null);
    }
  };

  const handleTimelineMouseLeave = () => {
    setTooltipInfo(null);
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

    // Round to nearest 5 minutes
    const roundTo = 5 / 60; // 5 minutes in hours
    const roundedTime = Math.round(xTime / roundTo) * roundTo;

    // Validate clicked area
    if (
      screenIndex >= 0 &&
      screenIndex < screens.length &&
      roundedTime >= 0 &&
      roundedTime <= 24
    ) {
      setSelectedScreen(screenIndex);
      setSelectedTime(timeToDate(roundedTime));
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

    // Check for overlapping movies with improved function
    const isOverlapping = checkOverlap(
      newScreen,
      newStartTime,
      newEndTime,
      movieId
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

  // Generate time labels - only showing hours
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

    // Round to nearest 5 minutes
    const roundTo = 5 / 60; // 5 minutes in hours
    const roundedStartTime = Math.round(startTime / roundTo) * roundTo;

    // Calculate end time including movie duration and interval time
    const totalDuration = movie.duration + intervalTime;
    const endTime = roundedStartTime + totalDuration / 60;

    // Check if the end time exceeds the 24-hour limit
    if (endTime > 24) {
      message.error("Cannot schedule movie beyond 24:00");
      return;
    }

    // Check for overlapping movies using improved function
    const isOverlapping = checkOverlap(
      selectedScreen,
      roundedStartTime,
      endTime
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
      startTime: roundedStartTime,
      endTime: endTime,
      title: movie.title,
      image: movie.image,
      director: movie.director,
      genre: movie.genre,
      duration: movie.duration,
      intervalTime: intervalTime,
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
    setIntervalTime(15); // Reset to default interval
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

  // Calculate the timeline width - ensure it fills container and provides adequate space
  const calculateVisibleWidth = () => {
    // Width for the timeline (12 hours * scale)
    const timelineWidth = (xDomain[1] - xDomain[0]) * scale.x;

    // Return the larger of the fixed width or container width
    return Math.max(timelineWidth, containerWidth || window.innerWidth - 48);
  };

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
                  Click to schedule • Drag movies to reschedule • Click on movie
                  for details
                </Text>
              </div>
            </div>

            <div
              className="border rounded overflow-hidden relative"
              style={{ height: Math.max(500, screens.length * rowHeight + 40) }}
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
                      className="absolute h-full border-l border-gray-300 font-medium"
                      style={{
                        left: `${label.position}px`,
                      }}
                    >
                      <div className="px-1 py-2">
                        {label.time.toString().padStart(2, "0")}:00
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
                  onMouseMove={handleTimelineMouseMove}
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
                      isSelected={
                        selectedMovie && selectedMovie.id === movie.id
                      }
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
              minuteStep={5}
              use12Hours={false}
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

          <div>
            <Text strong>Interval Time (minutes):</Text>
            <InputNumber
              style={{ width: "100%", marginTop: 8 }}
              min={0}
              max={60}
              value={intervalTime}
              onChange={(value) => setIntervalTime(value)}
            />
            <Text type="secondary" className="mt-1 block">
              Time between movies for breaks and setup
            </Text>
          </div>

          {selectedMovieId && (
            <div>
              <Text type="secondary">
                Duration:{" "}
                {movies.find((m) => m.id === selectedMovieId)?.duration} minutes
              </Text>
              <Text type="secondary" className="block">
                Total Time:{" "}
                {movies.find((m) => m.id === selectedMovieId)?.duration +
                  intervalTime}{" "}
                minutes (including {intervalTime} min interval)
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </Layout>
  );
}
