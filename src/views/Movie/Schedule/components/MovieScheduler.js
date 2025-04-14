import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Button, Typography, message, Modal, Drawer, Card } from "antd";
import dayjs from "dayjs";
import MovieDetails from "./MovieDetails";
import {
  setSelectedMovie,
  addScheduledMovie,
  removeScheduledMovie,
  updateScheduledMovie,
} from "store/slices/movieScheduleSlice";
import Header from "./Header";
import Timeline from "./Timeline";
import ScheduleForm from "./ScheduleForm";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import {
  timeToDate,
  dateToTime,
  formatTime,
  isMovieVisible,
  checkOverlap,
  calculateVisibleWidth,
} from "../utils";
import { fetchScreenData } from "store/slices/screenSlice";

const { Content } = Layout;
const { Title, Text } = Typography;

// Main App Component
export default function MovieScheduler() {
  const dispatch = useDispatch();
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

  // Get screen data from Redux state
  const { response, loading, error } = useSelector((state) => state.screen);

  // Extract screen names properly
  const extractScreenNames = () => {
    if (!response || !response.items || response.items.length === 0) {
      return [];
    }

    // Flatten all screens from all theaters
    const allScreens = [];
    response.items.forEach((theatre) => {
      if (theatre.movie_screen && Array.isArray(theatre.movie_screen)) {
        theatre.movie_screen.forEach((screen) => {
          if (screen && screen.screen_name) {
            allScreens.push(screen.screen_name);
          }
        });
      }
    });

    return allScreens;
  };

  const screens = extractScreenNames();


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

  // Handle mouse move for tooltips
  const handleTimelineMouseMove = (e, timelineRef) => {
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

    const rect = e.currentTarget.getBoundingClientRect();
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
      scheduledMovies,
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
      endTime,
      scheduledMovies
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

  const visibleWidth = calculateVisibleWidth(xDomain, scale, containerWidth);

  // Row height for each screen
  const rowHeight = 80;

  // Show loading state or error if applicable
  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-4">
          <Card>
            <div className="text-center p-8">Loading screen data...</div>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-4">
          <Card>
            <div className="text-center p-8 text-red-500">
              Error loading screen data: {error}
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

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

            {screens.length > 0 ? (
              <Timeline
                screens={screens}
                scheduledMovies={scheduledMovies}
                selectedMovie={selectedMovie}
                xDomain={xDomain}
                scale={scale}
                visibleWidth={visibleWidth}
                rowHeight={rowHeight}
                formatTime={formatTime}
                handleTimelineClick={handleTimelineClick}
                handleTimelineMouseMove={handleTimelineMouseMove}
                handleTimelineMouseLeave={handleTimelineMouseLeave}
                handleMovieClick={handleMovieClick}
                handleMovieDragEnd={handleMovieDragEnd}
                tooltipInfo={tooltipInfo}
                isMovieVisible={(movie) => isMovieVisible(movie, xDomain)}
              />
            ) : (
              <div className="text-center p-8">
                No screens available. Please add screens to schedule movies.
              </div>
            )}
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
        <ScheduleForm
          movies={movies}
          screens={screens}
          selectedMovieId={selectedMovieId}
          selectedTime={selectedTime}
          selectedScreen={selectedScreen}
          intervalTime={intervalTime}
          setSelectedMovieId={setSelectedMovieId}
          setSelectedTime={setSelectedTime}
          setSelectedScreen={setSelectedScreen}
          setIntervalTime={setIntervalTime}
        />
      </Modal>
    </Layout>
  );
}
