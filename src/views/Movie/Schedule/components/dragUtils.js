// dragUtils.js
import React from "react";

// Creates a styled ghost image for dragging movies
export const createDragGhost = (movie) => {
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

  // Format based on if it's a scheduled movie or available movie
  if (movie.startMinutes !== undefined && movie.endMinutes !== undefined) {
    // For scheduled movies, show start and end time
    const startHour = Math.floor(movie.startMinutes / 60);
    const startMinute = movie.startMinutes % 60;
    const endHour = Math.floor(movie.endMinutes / 60);
    const endMinute = movie.endMinutes % 60;

    const startTimeFormatted = `${startHour
      .toString()
      .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
    const endTimeFormatted = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    durationDiv.textContent = `${startTimeFormatted} - ${endTimeFormatted}`;
  } else {
    // For available movies, show duration
    durationDiv.textContent = `${Math.floor(movie.duration / 60)}h ${
      movie.duration % 60
    }m`;
  }

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

  return ghost;
};

// Handle drag start for new movies
export const handleDragStart = (
  event,
  movie,
  setDraggedMovie,
  setDraggedScheduledMovie
) => {
  setDraggedMovie(movie);
  setDraggedScheduledMovie(null);

  // Create ghost image for drag
  const ghost = createDragGhost(movie);
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, 90, 20);

  // Remove the ghost after drag ends
  setTimeout(() => {
    document.body.removeChild(ghost);
  }, 0);
};

// Handle drag start for scheduled movies
export const handleScheduledMovieDragStart = (
  event,
  scheduledMovie,
  availableMovies,
  setDraggedScheduledMovie,
  setDraggedMovie
) => {
  event.stopPropagation();
  setDraggedScheduledMovie(scheduledMovie);
  setDraggedMovie(null);

  const movie = availableMovies.find((m) => m.id === scheduledMovie.movieId);
  if (!movie) return;

  // Create combined movie object for the ghost image
  const combinedMovie = {
    ...movie,
    ...scheduledMovie,
  };

  // Create ghost image for drag
  const ghost = createDragGhost(combinedMovie);
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, 90, 20);

  // Remove the ghost after drag ends
  setTimeout(() => {
    document.body.removeChild(ghost);
  }, 0);
};

// Handle dropping movies on the schedule
export const handleDrop = (
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
  scheduleMovieAction,
  setDraggedMovie,
  setDraggedScheduledMovie,
  calculateTimeFromPosition
) => {
  event.preventDefault();

  if (
    (!draggedMovie && !draggedScheduledMovie) ||
    !gridContentRef.current ||
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
    const currentDayMovies = scheduledMovies[activeTab] || [];
    const conflicts = currentDayMovies.some((movie) => {
      if (movie.screen.id !== newScheduledMovie.screen.id) return false;

      // Check if the new movie overlaps with an existing one
      return (
        newScheduledMovie.startMinutes < movie.endMinutes &&
        newScheduledMovie.endMinutes > movie.startMinutes
      );
    });

    if (!conflicts) {
      // Use the correct action structure
      dispatch(
        scheduleMovieAction({
          ...scheduledMovies,
          [activeTab]: [
            ...(scheduledMovies[activeTab] || []),
            newScheduledMovie,
          ],
        })
      );
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
    const currentDayMovies = scheduledMovies[activeTab] || [];
    const conflicts = currentDayMovies.some((movie) => {
      if (movie.id === draggedScheduledMovie.id) return false;
      if (movie.screen.id !== updatedScheduledMovie.screen.id) return false;

      // Check if the movie overlaps with an existing one
      return (
        updatedScheduledMovie.startMinutes < movie.endMinutes &&
        updatedScheduledMovie.endMinutes > movie.startMinutes
      );
    });

    if (!conflicts) {
      // Use the correct action structure
      dispatch(
        scheduleMovieAction({
          ...scheduledMovies,
          [activeTab]: (scheduledMovies[activeTab] || []).map((movie) =>
            movie.id === draggedScheduledMovie.id
              ? updatedScheduledMovie
              : movie
          ),
        })
      );
    }
  }

  setDraggedMovie(null);
  setDraggedScheduledMovie(null);
};
