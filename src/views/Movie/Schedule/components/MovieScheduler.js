import React, { useState, useRef, useEffect } from "react";

import {
  calculateTimeFromPosition,
  checkScheduleOverlap,
  extractScreenInfo,
  handleCrossDayScheduling,
} from "./utils";
import {
  handleDragStart,
  handleScheduledMovieDragStart,
  handleDrop as utilsHandleDrop,
} from "./dragUtils";
import { MovieDetail } from "./MovieDetail";
import MovieList from "./MovieList";
import TimeRuler from "./TimeRuler";
import ScheduleGrid from "./ScheduleGrid";
import HoverIndicator from "./HoverIndicator";
import ScheduledMovies from "./ScheduledMovies";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchAllCoupons } from "store/slices/couponSlice";
import { fetchAllOffers } from "store/slices/offerSlice";
import {
  scheduleMovie,
  setActiveTab,
  setCoupons,
  setOffers,
  setSeatStructure,
  setIntervalTime,
} from "store/slices/movieScheduleSlice";
import { message } from "antd";
import dayjs from "dayjs";
export default function MovieScheduler({ form }) {
  const dispatch = useDispatch();

  const [draggedMovie, setDraggedMovie] = useState(null);
  const [draggedScheduledMovie, setDraggedScheduledMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [hoverPosition, setHoverPosition] = useState({
    visible: false,
    time: null,
    screen: null,
    x: 0,
    y: 0,
  });

  const {
    scheduledMovies,
    activeTab,
    coupons: movieCoupons,
    offers: movieOffers,
    seatStructures: movieSeatStructures,
    intervalTimes,
    dateRange,
    availableMovies,
  } = useSelector((state) => state.movieScheduleSlice);

  const { response, loading, error } = useSelector((state) => state.screen);
  const { filteredCoupons } = useSelector((state) => state.coupons);
  const { filteredOffers } = useSelector((state) => state.offers);
  const { allSeats } = useSelector((state) => state.movieSeatSlice);
  const hourWidth = 100;
  const rowHeight = 80;
  const sidebarWidth = 128;
  const gridRef = useRef(null);
  const gridContentRef = useRef(null);
  const timeRulerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllCoupons({ ...DEFAULT_PAGE_SIZE, active: true }));
    dispatch(fetchAllOffers({ ...DEFAULT_PAGE_SIZE, active: true }));
  }, [dispatch]);

  const screens = extractScreenInfo(response);

  const handleMovieDragStart = (event, movie) => {
    handleDragStart(event, movie, setDraggedMovie, setDraggedScheduledMovie);
  };

  const handleMovieScheduledDragStart = (event, scheduledMovie) => {
    handleScheduledMovieDragStart(
      event,
      scheduledMovie,
      availableMovies,
      setDraggedScheduledMovie,
      setDraggedMovie
    );
  };

  const handleDropMovie = (event) => {
    utilsHandleDrop(
      event,
      draggedMovie,
      draggedScheduledMovie,
      gridContentRef,
      timeRulerRef,
      screens,
      hourWidth,
      rowHeight,
      scheduledMovies,
      activeTab,
      availableMovies,
      dispatch,
      scheduleMovie,
      setDraggedMovie,
      setDraggedScheduledMovie,
      calculateTimeFromPosition
    );
  };

  const handleMouseLeave = () => {
    setHoverPosition({ visible: false });
  };

  // Handle mouse move for hover positioning (keep this in component)
  const handleMouseMove = (event) => {
    if (!gridContentRef.current || !timeRulerRef.current) return;

    const gridRect = gridContentRef.current.getBoundingClientRect();
    const timeRulerRect = timeRulerRef.current.getBoundingClientRect();

    // Calculate position relative to the grid content
    const x = event.clientX - gridRect.left;
    const y = event.clientY - gridRect.top;

    // Calculate screen index correctly based on y position
    const screenIndex = Math.floor(y / rowHeight);

    // Don't show if outside valid area
    if (screenIndex < 0 || screenIndex >= screens.length) {
      setHoverPosition({ visible: false });
      return;
    }

    // Calculate time using client position relative to time ruler
    const time = calculateTimeFromPosition(
      event.clientX,
      timeRulerRect,
      hourWidth
    );
    const formattedTime = `${time.hour
      .toString()
      .padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`;

    // Calculate position for the vertical time indicator line
    const offsetX = event.clientX - timeRulerRect.left;

    setHoverPosition({
      visible: true,
      time: formattedTime,
      screen: screens[screenIndex].name,
      x: event.clientX,
      y: event.clientY,
      timeLineX: offsetX,
      screenLineY: screenIndex * rowHeight,
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    handleMouseMove(event);
  };

  const handleScheduledMovieClick = (event, scheduledMovie) => {
    if (!draggedScheduledMovie) {
      event.stopPropagation();
      const movie = availableMovies.find(
        (m) => m.id === scheduledMovie.movieId
      );

      // Get associated data for this movie
      const coupons = movieCoupons[scheduledMovie.id] || [];
      const offers = movieOffers[scheduledMovie.id] || [];
      const seatStructureId = movieSeatStructures[scheduledMovie.id] || null;
      const intervalTime = intervalTimes[scheduledMovie.id] || 15; // Default 15 min

      setSelectedMovie({
        ...scheduledMovie,
        title: movie.title,
        duration: movie.duration,
        color: movie.color,
        image: movie.image || movie.thumbnail_image,
        thumbnail_image: movie.thumbnail_image || movie.image,
        description: movie.description,
        genre: movie.genre,
        language: movie.language,
        country: movie.country,
        director: movie.director,
        released: movie.released,
        rating: movie.rating,
        coupons: coupons,
        offers: offers,
        seatStructureId: seatStructureId,
        intervalTime: intervalTime,
      });
      setIsDetailsOpen(true);
    }
  };

  // In MovieScheduler component:
  const generateDates = () => {
    const dates = [];

    // Check if we have a valid date range
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startDate = dayjs(dateRange[0]);
      const endDate = dayjs(dateRange[1]);
      const dayCount = Math.min(endDate.diff(startDate, "day") + 1, 7); // Limit to max 7 days

      // Generate dates from selected range
      for (let i = 0; i < dayCount; i++) {
        const date = startDate.add(i, "day");
        const jsDate = date.toDate();

        const day = jsDate.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = jsDate.getDate();
        const month = jsDate.toLocaleDateString("en-US", { month: "short" });

        dates.push({
          day,
          dayNum,
          month,
          weekday: i, // Use index as weekday to match activeTab
        });
      }
    } else {
      // Fallback to current behavior if no date range is set
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });

        dates.push({ day, dayNum, month, weekday: date.getDay() });
      }
    }

    return dates;
  };
  const dates = generateDates();

  const handleUpdateSchedule = (updatedMovie) => {
    // Always ensure we have a temp_id for cross-day movie parts
    const temp_id =
      updatedMovie.temp_id ||
      `movie_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    updatedMovie.temp_id = temp_id;

    // Calculate true duration - use stored values if available, or calculate
    const duration =
      updatedMovie.actualDuration ||
      updatedMovie.originalDuration ||
      updatedMovie.endMinutes - updatedMovie.startMinutes;

    // Make sure we store both duration properties consistently
    updatedMovie.actualDuration = duration;
    updatedMovie.originalDuration = duration;

    // If the movie is a continuation, recalculate its end time based on actual duration
    if (updatedMovie.isContinuation && updatedMovie.startMinutes === 0) {
      updatedMovie.endMinutes = duration;
    }
    // If this is after midnight (24 hours), move to next day tab
    if (updatedMovie.startMinutes >= 24 * 60) {
      const nextDayTab = (activeTab + 1) % 7;

      // Adjust times for next day (subtract 24 hours in minutes)
      const adjustedMovie = {
        ...updatedMovie,
        startMinutes: updatedMovie.startMinutes - 24 * 60,
        endMinutes: updatedMovie.endMinutes - 24 * 60,
        isMidnightPassed: false, // Reset as it's now properly on next day
        temp_id: temp_id,
      };

      // Check for conflicts on next day
      const nextDayMovies = scheduledMovies[nextDayTab] || [];
      const overlapCheck = checkScheduleOverlap(
        adjustedMovie,
        nextDayMovies,
        true,
        updatedMovie.id
      );

      if (!overlapCheck.isValid) {
        message.error(overlapCheck.message);
        return false;
      }

      // Remove all related movie parts from all days
      const updatedSchedule = {};
      for (const [tab, movies] of Object.entries(scheduledMovies)) {
        updatedSchedule[tab] = movies.filter((m) => m.temp_id !== temp_id);
      }

      // Add to next day
      updatedSchedule[nextDayTab] = [
        ...(updatedSchedule[nextDayTab] || []),
        adjustedMovie,
      ];

      dispatch(scheduleMovie(updatedSchedule));
      dispatch(setActiveTab(nextDayTab)); // Switch to next day tab

      updateAssociatedData(adjustedMovie);
      closeDetails();
      return true;
    }

    // Check if movie crosses midnight (ends after 24 hours)
    const crossesMidnight = updatedMovie.endMinutes > 24 * 60;

    if (crossesMidnight) {
      // Show warning that movie crosses into next day
      message.warning(`This movie crosses midnight into the next day.`);

      // Mark as midnight passed
      updatedMovie.isMidnightPassed = true;

      // First, remove all movie parts with same temp_id from all days
      const cleanedSchedule = {};
      for (const [tab, movies] of Object.entries(scheduledMovies)) {
        cleanedSchedule[tab] = movies.filter(
          (m) => m.temp_id !== temp_id && m.id !== updatedMovie.id
        );
      }

      // Handle cross-day scheduling using utility function
      const crossDayResult = handleCrossDayScheduling(
        updatedMovie,
        cleanedSchedule,
        activeTab,
        7
      );

      if (crossDayResult.isValid) {
        dispatch(
          scheduleMovie({
            ...cleanedSchedule,
            ...crossDayResult.schedules,
          })
        );

        updateAssociatedData(updatedMovie);
        closeDetails();
        return true;
      } else {
        message.error(crossDayResult.message);
        return false;
      }
    } else {
      // Regular scheduling - verify no conflicts
      const currentDayMovies = scheduledMovies[activeTab] || [];
      const overlapCheck = checkScheduleOverlap(
        updatedMovie,
        currentDayMovies,
        true,
        updatedMovie.id
      );

      if (!overlapCheck.isValid) {
        message.error(overlapCheck.message);
        return false;
      }

      // Remove all related movie parts
      const cleanedSchedule = {};
      for (const [tab, movies] of Object.entries(scheduledMovies)) {
        cleanedSchedule[tab] = movies.filter(
          (m) => m.temp_id !== temp_id && m.id !== updatedMovie.id
        );
      }

      // Add updated movie to current day
      cleanedSchedule[activeTab] = [
        ...(cleanedSchedule[activeTab] || []),
        updatedMovie,
      ];

      dispatch(scheduleMovie(cleanedSchedule));
      updateAssociatedData(updatedMovie);
      closeDetails();
      return true;
    }
  };
  const updateAssociatedData = (updatedMovie) => {
    if (updatedMovie.coupons && updatedMovie.coupons.length > 0) {
      dispatch(
        setCoupons({
          movieId: updatedMovie.id,
          couponIds: updatedMovie.coupons,
        })
      );
    }

    if (updatedMovie.offers && updatedMovie.offers.length > 0) {
      dispatch(
        setOffers({
          movieId: updatedMovie.id,
          offerIds: updatedMovie.offers,
        })
      );
    }

    if (updatedMovie.seatStructureId) {
      dispatch(
        setSeatStructure({
          movieId: updatedMovie.id,
          seatStructureId: updatedMovie.seatStructureId,
        })
      );
    }

    if (updatedMovie.intervalTime !== undefined) {
      dispatch(
        setIntervalTime({
          movieId: updatedMovie.id,
          intervalTime: updatedMovie.intervalTime,
        })
      );
    }
  };

  // Helper function to close the details panel
  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  const handleRemoveSchedule = (id) => {
    // Find the movie to be deleted
    const movieToDelete = (scheduledMovies[activeTab] || []).find(
      (movie) => movie.id === id
    );

    if (!movieToDelete) return;

    // Get the temp_id to remove all related movie parts
    const temp_id = movieToDelete.temp_id;

    // Create updated schedule by removing all movies with the same temp_id
    const updatedSchedule = {};
    for (const [tab, movies] of Object.entries(scheduledMovies)) {
      updatedSchedule[tab] = movies.filter((m) => m.temp_id !== temp_id);
    }

    dispatch(scheduleMovie(updatedSchedule));
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="container mx-auto">
      <div className="flex mb-4 border-b p-2 bg-white rounded-xl">
        {dates.map((date, index) => (
          <button
            key={index}
            className={`py-2 px-4 flex flex-col items-center ${
              activeTab === date.weekday
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
            onClick={() => dispatch(setActiveTab(date.weekday))}
          >
            <span className="text-sm">{date.day}</span>
            <span className="font-bold">{date.dayNum}</span>
            <span className="text-xs">{date.month}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        {/* Movie list */}
        <MovieList
          movies={availableMovies}
          handleDragStart={handleMovieDragStart} // Updated to use the wrapper function
        />

        <div
          className="flex-1 overflow-x-auto bg-white p-4 rounded-xl shadow"
          ref={gridRef}
        >
          <TimeRuler hourWidth={hourWidth} timeRulerRef={timeRulerRef} />
          <div
            className="relative"
            ref={gridContentRef}
            onDrop={handleDropMovie} // Updated to use the wrapper function
            onDragOver={handleDragOver}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <ScheduleGrid
              screens={screens}
              hourWidth={hourWidth}
              rowHeight={rowHeight}
            />

            <ScheduledMovies
              scheduledMovies={scheduledMovies}
              activeTab={activeTab}
              screens={screens}
              movies={availableMovies}
              rowHeight={rowHeight}
              hourWidth={hourWidth}
              sidebarWidth={sidebarWidth}
              handleScheduledMovieClick={handleScheduledMovieClick}
              handleScheduledMovieDragStart={handleMovieScheduledDragStart} // Updated to use the wrapper function
            />

            <HoverIndicator
              hoverPosition={hoverPosition}
              sidebarWidth={sidebarWidth}
              rowHeight={rowHeight}
            />
          </div>
        </div>
      </div>

      {isDetailsOpen && selectedMovie && (
        <MovieDetail
          form={form}
          movie={selectedMovie}
          screens={screens}
          coupons={filteredCoupons}
          seats={allSeats}
          offers={filteredOffers}
          onUpdate={handleUpdateSchedule}
          onClose={() => setIsDetailsOpen(false)}
          onDelete={handleRemoveSchedule}
        />
      )}
    </div>
  );
}
