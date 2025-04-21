// dragUtils.js
import React from "react";
import { checkScheduleOverlap, handleCrossDayScheduling } from "./utils";
import { message } from "antd";
import { setActiveTab } from "store/slices/movieScheduleSlice";

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
  calculateTimeFromPosition,
  totalDays = 7
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
    // Generate a unique temp_id for linking related movie parts
    const temp_id = `movie_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Handle new movie being scheduled
    const newScheduledMovie = {
      id: Date.now(),
      movieId: draggedMovie.id,
      screen: screens[screenIndex],
      startMinutes: snappedStartMinutes,
      endMinutes: snappedStartMinutes + draggedMovie.duration,
      intervals: 15, // 15-minute interval between movies
      temp_id: temp_id, // Add the unique temp_id
      actualDuration: draggedMovie.duration, // Store the actual duration
    };

    // Check for conflicts using the utility function
    const currentDayMovies = scheduledMovies[activeTab] || [];
    const overlapCheck = checkScheduleOverlap(
      newScheduledMovie,
      currentDayMovies
    );

    if (!overlapCheck.isValid) {
      // Show error message to user
      message.error(overlapCheck.message);

      // If the movie starts after midnight, suggest scheduling it on the next day
      if (overlapCheck.startsAfterMidnight) {
        const nextDayTab = (activeTab + 1) % totalDays;
        dispatch(setActiveTab(nextDayTab));
      }

      return;
    }

    // Adjust for midnight crossing
    if (newScheduledMovie.endMinutes > 24 * 60) {
      console.log("Movie crosses midnight", {
        startMinutes: newScheduledMovie.startMinutes,
        endMinutes: newScheduledMovie.endMinutes,
        duration: draggedMovie.duration,
      });

      // Movie crosses midnight - handle cross-day scheduling
      const crossDayResult = handleCrossDayScheduling(
        newScheduledMovie,
        scheduledMovies,
        activeTab,
        totalDays
      );

      console.log("Cross day scheduling result:", crossDayResult);

      if (crossDayResult.isValid) {
        // Update multiple days
        dispatch(
          scheduleMovieAction({
            ...scheduledMovies,
            ...crossDayResult.schedules,
          })
        );
      } else {
        message.error(crossDayResult.message);
      }
    } else {
      // Standard case - just add to current day
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

    // Calculate the correct duration - prioritize stored duration values
    const duration =
      draggedScheduledMovie.actualDuration ||
      draggedScheduledMovie.originalDuration ||
      draggedScheduledMovie.endMinutes - draggedScheduledMovie.startMinutes;

    // Use the original temp_id or create a new one if it doesn't exist
    const temp_id =
      draggedScheduledMovie.temp_id ||
      `movie_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const updatedScheduledMovie = {
      ...draggedScheduledMovie,
      screen: screens[screenIndex],
      startMinutes: snappedStartMinutes,
      endMinutes: snappedStartMinutes + duration,
      temp_id: temp_id,
      actualDuration: duration,
      originalDuration: duration,
    };

    // Remove flags when rescheduling to ensure clean state
    if (updatedScheduledMovie.isContinuation) {
      delete updatedScheduledMovie.isContinuation;
    }
    if (updatedScheduledMovie.isMidnightPassed) {
      delete updatedScheduledMovie.isMidnightPassed;
    }
    if (updatedScheduledMovie.originalId) {
      delete updatedScheduledMovie.originalId;
    }

    if (snappedStartMinutes > 0 && updatedScheduledMovie.isContinuation) {
      delete updatedScheduledMovie.isContinuation;
      delete updatedScheduledMovie.originalId;
    }

    // Handle the case where we're moving the movie after midnight
    if (updatedScheduledMovie.startMinutes >= 24 * 60) {
      // Move the scheduling to the next day
      const nextDayTab = (activeTab + 1) % totalDays;
      const adjustedMovie = {
        ...updatedScheduledMovie,
        startMinutes: updatedScheduledMovie.startMinutes - 24 * 60,
        endMinutes: updatedScheduledMovie.endMinutes - 24 * 60,
        isMidnightPassed: true,
      };

      // Switch to next day tab and schedule there
      dispatch(setActiveTab(nextDayTab));

      // Check if this time slot is available on the next day
      const nextDayMovies = scheduledMovies[nextDayTab] || [];
      const nextDayCheck = checkScheduleOverlap(
        adjustedMovie,
        nextDayMovies,
        true,
        draggedScheduledMovie.id
      );

      if (!nextDayCheck.isValid) {
        message.error(nextDayCheck.message);
        return;
      }

      // Remove the original movie and any of its linked parts
      const updatedSchedule = {};
      for (const [tab, movies] of Object.entries(scheduledMovies)) {
        updatedSchedule[tab] = movies.filter(
          (m) => m.temp_id !== draggedScheduledMovie.temp_id
        );
      }

      // Add to next day
      updatedSchedule[nextDayTab] = [...nextDayMovies, adjustedMovie];

      dispatch(scheduleMovieAction(updatedSchedule));
    } else {
      // Check for conflicts using the utility function
      const currentDayMovies = scheduledMovies[activeTab] || [];
      const overlapCheck = checkScheduleOverlap(
        updatedScheduledMovie,
        currentDayMovies,
        true,
        draggedScheduledMovie.id
      );

      if (!overlapCheck.isValid) {
        message.error(overlapCheck.message);
        return;
      }

      // First, remove any movies with the same temp_id from all days
      const cleanedSchedules = {};
      for (const [tab, movies] of Object.entries(scheduledMovies)) {
        cleanedSchedules[tab] = movies.filter(
          (m) => m.temp_id !== draggedScheduledMovie.temp_id
        );
      }

      // Check if the movie crosses midnight
      if (updatedScheduledMovie.endMinutes > 24 * 60) {
        // Update with the midnight passed flag
        updatedScheduledMovie.isMidnightPassed = true;

        // Handle editing a movie that now crosses midnight
        const crossDayResult = handleCrossDayScheduling(
          updatedScheduledMovie,
          cleanedSchedules,
          activeTab,
          totalDays
        );

        if (crossDayResult.isValid) {
          dispatch(
            scheduleMovieAction({
              ...scheduledMovies,
              ...crossDayResult.schedules,
            })
          );
        } else {
          message.error(crossDayResult.message);
        }
      } else {
        // Standard case - update in current day
        cleanedSchedules[activeTab] = [
          ...(cleanedSchedules[activeTab] || []),
          updatedScheduledMovie,
        ];

        dispatch(scheduleMovieAction(cleanedSchedules));
      }
    }
  }

  setDraggedMovie(null);
  setDraggedScheduledMovie(null);
};
