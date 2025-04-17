// MovieScheduler.jsx
import React, { useState, useRef, useEffect } from "react";

import {
  calculateTimeFromPosition,
  extractMovies,
  extractScreenInfo,
} from "./utils";
import { MovieDetail } from "./MovieDetail";
import ScheduleHeader from "./Header";
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

export default function MovieScheduler({ form }) {
  const [activeTab, setActiveTab] = useState(0);
  const [scheduledMovies, setScheduledMovies] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  });
  const dispatch = useDispatch();

  const [draggedMovie, setDraggedMovie] = useState(null);
  const [draggedScheduledMovie, setDraggedScheduledMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [seatStructure, setSeatStructure] = useState({ rows: 10, cols: 12 });
  const [coupon, setCoupon] = useState("");
  // Add hover position state
  const [hoverPosition, setHoverPosition] = useState({
    visible: false,
    time: null,
    screen: null,
    x: 0,
    y: 0,
  });
  const { movieResponse } = useSelector((state) => state.movie);
  const { response, loading, error } = useSelector((state) => state.screen);
  const { filteredCoupons } = useSelector((state) => state.coupons);
  const { filteredOffers } = useSelector((state) => state.offers);
  const { allSeats } = useSelector((state) => state.movieSeatSlice);
  // Constants for the grid
  const hourWidth = 100;
  const rowHeight = 80;
  const sidebarWidth = 128; // Width of the screen list column (32px * 4)
  const gridRef = useRef(null);
  const gridContentRef = useRef(null);
  const timeRulerRef = useRef(null);

  useEffect(() => {
    if (!movieResponse) {
      dispatch(fetchMoviesData({ page: 1, size: 5 }));
    }
    dispatch(fetchAllCoupons({ ...DEFAULT_PAGE_SIZE, active: true }));

    dispatch(fetchAllOffers({ ...DEFAULT_PAGE_SIZE, active: true }));
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
  // Handle drag start event for new movies
  const handleDragStart = (event, movie) => {
    setDraggedMovie(movie);
    setDraggedScheduledMovie(null);

    // Create a more styled ghost image for drag that resembles a movie card
    const ghost = document.createElement("div");
    ghost.classList.add("ghost");
    ghost.style.backgroundColor = "white";
    ghost.style.padding = "8px";
    ghost.style.borderRadius = "8px";
    ghost.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    ghost.style.width = "180px";
    ghost.style.display = "flex";
    ghost.style.alignItems = "center";
    ghost.style.gap = "8px";

    // Add movie image if available
    if (movie.image) {
      const img = document.createElement("img");
      img.src = movie.image;
      img.style.width = "24px";
      img.style.height = "24px";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      ghost.appendChild(img);
    }

    // Add movie info
    const infoDiv = document.createElement("div");
    infoDiv.style.flexGrow = "1";

    const titleDiv = document.createElement("div");
    titleDiv.textContent = movie.title;
    titleDiv.style.fontWeight = "500";
    titleDiv.style.fontSize = "14px";
    infoDiv.appendChild(titleDiv);

    const durationDiv = document.createElement("div");
    durationDiv.textContent = `${Math.floor(movie.duration / 60)}h ${
      movie.duration % 60
    }m`;
    durationDiv.style.fontSize = "12px";
    durationDiv.style.color = "#666";
    infoDiv.appendChild(durationDiv);

    ghost.appendChild(infoDiv);

    // Add color indicator
    const colorDot = document.createElement("div");
    colorDot.style.width = "12px";
    colorDot.style.height = "12px";
    colorDot.style.borderRadius = "50%";
    colorDot.style.backgroundColor = movie.color;
    ghost.appendChild(colorDot);

    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 90, 20);

    // Remove the ghost after drag ends
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  // Similarly update handleScheduledMovieDragStart
  const handleScheduledMovieDragStart = (event, scheduledMovie) => {
    event.stopPropagation();
    setDraggedScheduledMovie(scheduledMovie);
    setDraggedMovie(null);

    const movie = availableMovies.find((m) => m.id === scheduledMovie.movieId);
    if (!movie) return;

    // Create a more styled ghost image for drag that resembles a movie card
    const ghost = document.createElement("div");
    ghost.classList.add("ghost");
    ghost.style.backgroundColor = "white";
    ghost.style.padding = "8px";
    ghost.style.borderRadius = "8px";
    ghost.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    ghost.style.width = "180px";
    ghost.style.display = "flex";
    ghost.style.alignItems = "center";
    ghost.style.gap = "8px";

    // Add movie image if available
    if (movie.image) {
      const img = document.createElement("img");
      img.src = movie.image;
      img.style.width = "24px";
      img.style.height = "24px";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      ghost.appendChild(img);
    }

    // Add movie info
    const infoDiv = document.createElement("div");
    infoDiv.style.flexGrow = "1";

    const titleDiv = document.createElement("div");
    titleDiv.textContent = movie.title;
    titleDiv.style.fontWeight = "500";
    titleDiv.style.fontSize = "14px";
    infoDiv.appendChild(titleDiv);

    // Calculate start and end times for display
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

    const durationDiv = document.createElement("div");
    durationDiv.textContent = `${startTimeFormatted} - ${endTimeFormatted}`;
    durationDiv.style.fontSize = "12px";
    durationDiv.style.color = "#666";
    infoDiv.appendChild(durationDiv);

    ghost.appendChild(infoDiv);

    // Add color indicator
    const colorDot = document.createElement("div");
    colorDot.style.width = "12px";
    colorDot.style.height = "12px";
    colorDot.style.borderRadius = "50%";
    colorDot.style.backgroundColor = movie.color;
    ghost.appendChild(colorDot);

    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 90, 20);

    // Remove the ghost after drag ends
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleMouseLeave = () => {
    setHoverPosition({ visible: false });
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (
      (!draggedMovie && !draggedScheduledMovie) ||
      !gridRef.current ||
      !timeRulerRef.current
    )
      return;

    const rect = gridContentRef.current.getBoundingClientRect();
    const y = event.clientY - rect.top;

    // Calculate screen index correctly - dividing by rowHeight
    const screenIndex = Math.floor(y / rowHeight);

    if (screenIndex < 0 || screenIndex >= screens.length) return;

    // Calculate time using our improved method
    const timeRulerRect = timeRulerRef.current.getBoundingClientRect();
    const time = calculateTimeFromPosition(
      event.clientX,
      timeRulerRect,
      hourWidth
    );
    const startMinutes = time.hour * 60 + time.minute;

    // Snap to 15-minute intervals
    const snappedStartMinutes = Math.round(startMinutes / 15) * 15;

    if (draggedMovie) {
      // Handle new movie being scheduled
      const newScheduledMovie = {
        id: Date.now(),
        movieId: draggedMovie.id,
        screen: screens[screenIndex],
        startMinutes: snappedStartMinutes,
        endMinutes: snappedStartMinutes + draggedMovie.duration,
        intervals: 15, // 15-minute interval between movies
      };

      // Check for conflicts
      const conflicts = scheduledMovies[activeTab].some((movie) => {
        if (movie.screen.id !== newScheduledMovie.screen.id) return false;

        // Check if the new movie overlaps with an existing one
        return (
          newScheduledMovie.startMinutes < movie.endMinutes &&
          newScheduledMovie.endMinutes > movie.startMinutes
        );
      });

      if (!conflicts) {
        setScheduledMovies({
          ...scheduledMovies,
          [activeTab]: [...scheduledMovies[activeTab], newScheduledMovie],
        });
      }
    } else if (draggedScheduledMovie) {
      // Handle rescheduling existing movie
      const movie = availableMovies.find(
        (m) => m.id === draggedScheduledMovie.movieId
      );
      if (!movie) return;

      const duration =
        draggedScheduledMovie.endMinutes - draggedScheduledMovie.startMinutes;

      const updatedScheduledMovie = {
        ...draggedScheduledMovie,
        screen: screens[screenIndex],
        startMinutes: snappedStartMinutes,
        endMinutes: snappedStartMinutes + duration,
      };

      // Check for conflicts (excluding the movie being dragged)
      const conflicts = scheduledMovies[activeTab].some((movie) => {
        if (movie.id === draggedScheduledMovie.id) return false;
        if (movie.screen.id !== updatedScheduledMovie.screen.id) return false;

        // Check if the movie overlaps with an existing one
        return (
          updatedScheduledMovie.startMinutes < movie.endMinutes &&
          updatedScheduledMovie.endMinutes > movie.startMinutes
        );
      });

      if (!conflicts) {
        setScheduledMovies({
          ...scheduledMovies,
          [activeTab]: scheduledMovies[activeTab].map((movie) =>
            movie.id === draggedScheduledMovie.id
              ? updatedScheduledMovie
              : movie
          ),
        });
      }
    }

    setDraggedMovie(null);
    setDraggedScheduledMovie(null);
  };

  // Handle mouse move for hover positioning
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
      });
      setIsDetailsOpen(true);
    }
  };
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
  // Handle updating scheduled movie
  const handleUpdateSchedule = (updatedMovie) => {
    setScheduledMovies({
      ...scheduledMovies,
      [activeTab]: scheduledMovies[activeTab].map((movie) =>
        movie.id === updatedMovie.id ? updatedMovie : movie
      ),
    });
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  // Handle removing scheduled movie
  const handleRemoveSchedule = (id) => {
    setScheduledMovies({
      ...scheduledMovies,
      [activeTab]: scheduledMovies[activeTab].filter(
        (movie) => movie.id !== id
      ),
    });
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="container mx-auto  ">
      <div className="flex mb-4 border-b p-2 bg-white rounded-xl ">
        {dates.map((date, index) => (
          <button
            key={index}
            className={`py-2 px-4 flex flex-col items-center ${
              activeTab === date.weekday
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(date.weekday)}
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
          handleDragStart={handleDragStart}
        />

        <div
          className="flex-1 overflow-x-auto  bg-white p-4 rounded-xl shadow"
          ref={gridRef}
        >
          <TimeRuler hourWidth={hourWidth} timeRulerRef={timeRulerRef} />
          <div
            className="relative"
            ref={gridContentRef}
            onDrop={handleDrop}
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
              handleScheduledMovieDragStart={handleScheduledMovieDragStart}
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
