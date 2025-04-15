import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout,
  Typography,
  message,
  Modal,
  Drawer,
  Card,
  Button,
  Tooltip,
} from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MovieDetails from "./MovieDetails";
import {
  setSelectedMovie,
  addScheduledMovie,
  removeScheduledMovie,
  updateScheduledMovie,
  setXDomain,
} from "store/slices/movieScheduleSlice";
import Header from "./Header";
import Timeline from "./Timeline";
import ScheduleForm from "./ScheduleForm";
import {
  timeToDate,
  dateToTime,
  formatTime,
  isMovieVisible,
  checkOverlap,
  calculateVisibleWidth,
} from "../utils";

const { Content } = Layout;
const { Title, Text } = Typography;

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
  const [intervalTime, setIntervalTime] = useState(15);
  const [scale, setScale] = useState({ x: 80 });

  const movies = useSelector((state) => state.movieScheduleSlice.movies);
  const allScheduledMovies = useSelector(
    (state) => state.movieScheduleSlice.scheduledMovies
  );
  const selectedMovie = useSelector(
    (state) => state.movieScheduleSlice.selectedMovie
  );
  const selectedDate = useSelector(
    (state) => state.movieScheduleSlice.selectedDate
  );
  const xDomain = useSelector((state) => state.movieScheduleSlice.xDomain);

  const scheduledMovies = allScheduledMovies.filter((movie) => {
    if (!selectedDate) return true;

    if (movie.scheduleDate) {
      const movieDate = dayjs(movie.scheduleDate).format("YYYY-MM-DD");
      const currentDate = selectedDate.format("YYYY-MM-DD");
      return movieDate === currentDate;
    }

    return false;
  });

  const { response, loading, error } = useSelector((state) => state.screen);

  const extractScreenNames = () => {
    if (!response || !response.items || response.items.length === 0) {
      return [];
    }

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

  // Handle user interactions with the timeline
  // In MovieScheduler.js, update the handleTimelineMouseMove function
  const handleTimelineMouseMove = (e, timelineRef) => {
    // Add a safety check to avoid accessing undefined.current
    if (!timelineRef || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const screenIndex = Math.floor((y / rect.height) * screens.length);
    const xTime = x / scale.x + xDomain[0];

    const roundTo = 5 / 60;
    const roundedTime = Math.round(xTime / roundTo) * roundTo;

    if (
      screenIndex >= 0 &&
      screenIndex < screens.length &&
      roundedTime >= 0 &&
      roundedTime <= 24
    ) {
      const tooltipWidth = 120;
      const tooltipHeight = 60;

      let tooltipX = x + 20;
      let tooltipY = y;

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

  const handleTimelineClick = (e) => {
    if (
      e.target.closest(".cursor-pointer") ||
      e.target.closest(".drag-handle") ||
      e.target.closest("button")
    ) {
      return;
    }

    if (!selectedDate) {
      message.warning("Please select a date first before scheduling a movie");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const screenIndex = Math.floor((y / rect.height) * screens.length);
    const xTime = x / scale.x + xDomain[0];

    const roundTo = 5 / 60;
    const roundedTime = Math.round(xTime / roundTo) * roundTo;

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

  const handleMovieClick = (movie) => {
    const fullMovie = movies.find((m) => m.id === movie.movieId);
    if (fullMovie) {
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

  const handleMovieDragEnd = (movieId, newStartTime, newEndTime, newScreen) => {
    const movie = scheduledMovies.find((m) => m.id === movieId);
    if (!movie) return;

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

    const updatedMovie = {
      ...movie,
      startTime: newStartTime,
      endTime: newEndTime,
      screen: newScreen,
    };

    dispatch(updateScheduledMovie(updatedMovie));

    message.success(`"${movie.title}" rescheduled successfully`);

    if (selectedMovie && selectedMovie.id === movieId) {
      dispatch(setSelectedMovie(updatedMovie));
    }
  };

  const handleScheduleMovie = () => {
    if (!selectedMovieId || !selectedTime || selectedScreen === null) {
      message.error("Please select a movie, time, and screen");
      return;
    }

    if (!selectedDate) {
      message.error("Please select a date first");
      return;
    }

    const movie = movies.find((m) => m.id === selectedMovieId);
    if (!movie) {
      message.error("Invalid movie selection");
      return;
    }

    const startTime = dateToTime(selectedTime);

    const roundTo = 5 / 60;
    const roundedStartTime = Math.round(startTime / roundTo) * roundTo;

    const totalDuration = movie.duration + intervalTime;
    const endTime = roundedStartTime + totalDuration / 60;

    if (endTime > 24) {
      message.error("Cannot schedule movie beyond 24:00");
      return;
    }

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
      scheduleDate: selectedDate.format("YYYY-MM-DD"),
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

  // Update the xDomain state when the timeline component changes it
  const handleXDomainChange = (newXDomain) => {
    dispatch(setXDomain(newXDomain));
  };

  const handleScaleChange = (newScale) => {
    setScale(newScale);
  };

  const visibleWidth = calculateVisibleWidth(xDomain, scale, containerWidth);
  const rowHeight = 80;

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
        <Content className="p-4">
          <Card>
            <div ref={containerRef} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Title level={4} className="m-0">
                    Schedule Timeline{" "}
                    {selectedDate && `- ${selectedDate.format("MMMM D, YYYY")}`}
                  </Title>
                  <Text type="secondary">
                    Click to schedule • Drag movies to reschedule • Click on
                    movie for details • Drag timeline to navigate • Use zoom
                    controls
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
            </div>
          </Card>
        </Content>
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
          selectedDate={selectedDate}
        />
      </Modal>
    </Layout>
  );
}
