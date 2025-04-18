import React, { useState, useRef, useEffect } from "react";

import {
  calculateTimeFromPosition,
  checkScheduleOverlap,
  extractMovies,
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
import { fetchMoviesData } from "store/slices/movieSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchAllCoupons } from "store/slices/couponSlice";
import { fetchAllOffers } from "store/slices/offerSlice";
import { getAllSeatStructures } from "store/slices/movieSeatSlice";
import {
  scheduleMovie,
  setActiveTab,
  setCoupons,
  setOffers,
  setSeatStructure,
  setIntervalTime,
} from "store/slices/movieScheduleSlice";
import { message } from "antd";

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

  // Redux selectors and refs remain the same
  const {
    scheduledMovies,
    activeTab,
    coupons: movieCoupons,
    offers: movieOffers,
    seatStructures: movieSeatStructures,
    intervalTimes,
  } = useSelector((state) => state.movieScheduleSlice);
  const { movieResponse } = useSelector((state) => state.movie);
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
    if (!movieResponse) {
      dispatch(fetchMoviesData({ page: 1, size: 5 }));
    }
    dispatch(fetchAllCoupons({ ...DEFAULT_PAGE_SIZE, active: true }));
    dispatch(fetchAllOffers({ ...DEFAULT_PAGE_SIZE, active: true }));
    dispatch(getAllSeatStructures());
  }, [dispatch, movieResponse]);

  const handleSearch = (value) => {
    setTimeout(() => {
      dispatch(
        fetchMoviesData({
          page: 1,
          size: 5,
          search: value,
        })
      );
    }, 300);
  };

  const screens = extractScreenInfo(response);
  const availableMovies = extractMovies(movieResponse);

  // Use the utility functions with proper bindings
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

  // Handle drag over event
  const handleDragOver = (event) => {
    event.preventDefault();
    // Call handleMouseMove to update hover position during drag
    handleMouseMove(event);
  };

  // Handle clicking on a scheduled movie
  const handleScheduledMovieClick = (event, scheduledMovie) => {
    // Only handle click if we're not dragging
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

  // The rest of the component remains unchanged
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });

      dates.push({ day, dayNum, month, weekday: date.getDay() });
    }

    return dates;
  };

  const dates = generateDates();

  const handleUpdateSchedule = (updatedMovie) => {
    // Check if this is an early morning movie (after midnight but before 6am)
    const isEarlyMorningMovie = updatedMovie.startMinutes >= 0 && updatedMovie.startMinutes < 6 * 60;
    const startsAfterMidnight = updatedMovie.startMinutes >= 24 * 60;
    
    // Handle case where the movie is scheduled for after midnight
    if (startsAfterMidnight) {
      // Need to move it to the next day
      const nextDayTab = (activeTab + 1) % 7;
      const adjustedMovie = {
        ...updatedMovie,
        startMinutes: updatedMovie.startMinutes - 24 * 60,
        endMinutes: updatedMovie.endMinutes - 24 * 60,
        isMidnightPassed: true
      };
      
      // Check for overlaps in the next day
      const nextDayMovies = scheduledMovies[nextDayTab] || [];
      const overlapCheck = checkScheduleOverlap(
        adjustedMovie,
        nextDayMovies,
        true,
        updatedMovie.id
      );
      
      if (!overlapCheck.isValid) {
        message.error(overlapCheck.message);
        return;
      }
      
      // Remove from current day and add to next day
      const updatedSchedule = {
        ...scheduledMovies,
        [activeTab]: (scheduledMovies[activeTab] || []).filter(
          m => m.id !== updatedMovie.id && m.originalId !== updatedMovie.id
        ),
        [nextDayTab]: [...nextDayMovies, adjustedMovie]
      };
      
      dispatch(scheduleMovie(updatedSchedule));
      dispatch(setActiveTab(nextDayTab)); // Optionally switch to the next day tab
      
      // Update associated data
      updateAssociatedData(adjustedMovie);
      closeDetails();
      return;
    }
    
    // For early morning movies, check if they should be treated as next-day movies
    if (isEarlyMorningMovie && !updatedMovie.isMidnightPassed) {
      // This is a morning movie but not marked as midnight passed
      // Ask user if they want to schedule it for the current day's early morning or previous day's late night
      const shouldScheduleAsMidnightPass = window.confirm(
        `Would you like to schedule this as a late-night movie (${updatedMovie.startMinutes} minutes past midnight)?`
      );
      
      if (shouldScheduleAsMidnightPass) {
        // Handle as midnight passed movie
        updatedMovie.isMidnightPassed = true;
      }
    }
    
    // Regular overlap check
    const currentDayMovies = scheduledMovies[activeTab] || [];
    const overlapCheck = checkScheduleOverlap(
      updatedMovie,
      currentDayMovies,
      true,
      updatedMovie.id
    );
  
    if (!overlapCheck.isValid) {
      message.error(overlapCheck.message);
      return;
    }
  
    // Check if movie crosses midnight
    if (overlapCheck.warning || overlapCheck.isMidnightPassed) {
      updatedMovie.isMidnightPassed = true;
      
      const crossDayResult = handleCrossDayScheduling(
        updatedMovie,
        {
          ...scheduledMovies,
          [activeTab]: currentDayMovies.filter(m => m.id !== updatedMovie.id)
        },
        activeTab,
        7 // Assuming 7 days in the week
      );
  
      if (crossDayResult.isValid) {
        dispatch(scheduleMovie({
          ...scheduledMovies,
          ...crossDayResult.schedules
        }));
      } else {
        message.error(crossDayResult.message);
        return;
      }
    } else {
      // Standard update
      dispatch(
        scheduleMovie({
          ...scheduledMovies,
          [activeTab]: currentDayMovies.map((movie) =>
            movie.id === updatedMovie.id ? updatedMovie : movie
          ),
        })
      );
    }
  
    // Update associated data
    updateAssociatedData(updatedMovie);
    closeDetails();
  };
  
  // Helper function to update associated data
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
    dispatch(
      scheduleMovie({
        ...scheduledMovies,
        [activeTab]: (scheduledMovies[activeTab] || []).filter(
          (movie) => movie.id !== id
        ),
      })
    );
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
          handleSearch={handleSearch}
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
