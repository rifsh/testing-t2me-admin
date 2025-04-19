import dayjs from 'dayjs';

// Convert 24-hour time to a dayjs object
export const timeToDate = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return dayjs().hour(hours).minute(minutes).second(0);
};

// Convert dayjs to 24-hour decimal time
export const dateToTime = (date) => {
  if (!date) return null;
  return date.hour() + date.minute() / 60;
};


export const formatTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Check if a movie is visible in the current domain
export const isMovieVisible = (movie, yDomain) => {
  return (
    movie.startTime < yDomain[1] && 
    movie.endTime > yDomain[0]
  );
};

// Improved overlap detection
export const checkOverlap = (
  screen,
  startTime,
  endTime,
  scheduledMovies,
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
      startTime + epsilon >= movie.startTime && startTime - epsilon <= movie.endTime;

    // Case 2: New movie ends during existing movie
    const endsInExisting =
      endTime + epsilon >= movie.startTime && endTime - epsilon <= movie.endTime;

    // Case 3: New movie fully contains existing movie
    const containsExisting =
      startTime - epsilon <= movie.startTime && endTime + epsilon >= movie.endTime;

    return startsInExisting || endsInExisting || containsExisting;
  });
};

// Calculate the visible width for the timeline
export const calculateVisibleWidth = (xDomain, scale, containerWidth) => {
  // Width for the timeline (e.g., 12 hours * scale)
  const timelineWidth = (xDomain[1] - xDomain[0]) * scale.x;

  // Return the larger of the fixed width or container width
  return Math.max(timelineWidth, containerWidth || window.innerWidth - 48);
};