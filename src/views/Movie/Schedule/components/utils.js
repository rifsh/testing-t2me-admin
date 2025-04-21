import { SCHEDULE_ERROR_MESSAGES } from "./constants";

// utils.js
export const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time for display
export const formatTime = (hour) => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Convert position to time
export const positionToTime = (position, hourWidth) => {
  const hour = Math.floor(position / hourWidth);
  const minute = Math.round((position % hourWidth) / (hourWidth / 60));
  return { hour, minute };
};

// Calculate time from position
export const calculateTimeFromPosition = (
  clientX,
  timeRulerRect,
  hourWidth
) => {
  if (!timeRulerRect) return { hour: 0, minute: 0 };

  // Calculate offset relative to the time ruler
  const offsetX = clientX - timeRulerRect.left;

  // Calculate hour and minute based on position
  const totalMinutes = (offsetX / hourWidth) * 60;

  // Cap at 24 hours (1440 minutes)
  const cappedMinutes = Math.min(Math.max(0, totalMinutes), 1439);

  const hour = Math.floor(cappedMinutes / 60);
  const minute = Math.floor(cappedMinutes % 60);

  return { hour, minute };
};

// Generate dates for the next 7 days
export const generateDates = () => {
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

export const getRandomColor = (id) => {
  const colors = [
    "#3498db", // Blue
    "#e74c3c", // Red
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#d35400", // Dark Orange
    "#34495e", // Navy
    "#16a085", // Dark Teal
    "#c0392b", // Dark Red
  ];
  // Use string hash to pick a consistent color
  const hash = id
    .toString()
    .split("")
    .reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

  return colors[hash % colors.length];
};

export const extractMovies = (movies) => {
  if (!movies || !movies.items || !Array.isArray(movies.items)) {
    return [];
  }

  return movies.items
    .map((item) => {
      if (!item) return null;

      return {
        id: item.id,
        title: item.title || "Untitled",
        description: item.description || "",
        thumbnail_image: item.thumbnail_image || "",
        genre: item.genre || [],
        language: item.language || "",
        country: item.country || "",
        director: item.director || "",
        released: item.released || "",
        rating: item.rating || "",
        runtime: parseInt(item.runtime, 10) || 90,
        duration: parseInt(item.runtime, 10) || 90,
        image: item.thumbnail_image || "",
        color: getRandomColor(item.id), // Assuming getRandomColor is defined elsewhere
        media_items: item.media_items || [],
        casts: item.casts || [],
        awards: item.awards || "",
        box_office: item.box_office || "",
        box_office_currency: item.box_office_currency || "",
        budget: item.budget || "",
        budget_currency: item.budget_currency || "",
        production_company: item.production_company || "",
        status: item.status || false,
      };
    })
    .filter(Boolean); // Remove null entries
};

export const extractScreenInfo = (response) => {
  if (!response || !response.items || response.items.length === 0) {
    return [];
  }

  const allScreens = [];
  response.items.forEach((theatre) => {
    if (theatre.movie_screen && Array.isArray(theatre.movie_screen)) {
      theatre.movie_screen.forEach((screen) => {
        if (screen) {
          allScreens.push({
            name: screen.screen_name,
            id: screen.screen_id,
            ...screen,
          });
        }
      });
    }
  });

  return allScreens;
};

// Updated checkScheduleOverlap function
export const checkScheduleOverlap = (
  movieToCheck,
  existingMovies,
  isEditing = false,
  editingId = null
) => {
  // First validate the movie time range
  if (movieToCheck.startMinutes >= movieToCheck.endMinutes) {
    return {
      isValid: false,
      message: SCHEDULE_ERROR_MESSAGES.INVALID_TIME,
    };
  }

  // Check if movie crosses midnight (24:00)
  const crossesMidnight = movieToCheck.endMinutes > 24 * 60;

  // If movie starts after midnight, it should only be scheduled for the next day
  const startsAfterMidnight = movieToCheck.startMinutes >= 24 * 60;

  if (startsAfterMidnight) {
    return {
      isValid: false,
      message: "Movie starts after midnight. Please schedule on the next day.",
      startsAfterMidnight: true,
    };
  }

  // Check for overlaps with existing movies on the same screen
  const overlappingMovie = existingMovies.find((movie) => {
    // Skip the movie being edited
    if (isEditing && movie.id === editingId) {
      return false;
    }

    if (movie.screen.id !== movieToCheck.screen.id) {
      return false;
    }

    return (
      movieToCheck.startMinutes < movie.endMinutes &&
      movieToCheck.endMinutes > movie.startMinutes
    );
  });

  if (overlappingMovie) {
    return {
      isValid: false,
      message: SCHEDULE_ERROR_MESSAGES.TIME_OVERLAP,
      conflictingMovie: overlappingMovie,
    };
  }

  if (crossesMidnight) {
    return {
      isValid: true,
      warning: true,
      message: SCHEDULE_ERROR_MESSAGES.CROSS_MIDNIGHT,
      isMidnightPassed: true,
    };
  }

  return {
    isValid: true,
  };
};
export const handleCrossDayScheduling = (
  scheduledMovie,
  existingSchedules,
  currentDay,
  totalDays = 7
) => {
  const originalDuration =
    scheduledMovie.actualDuration ||
    scheduledMovie.endMinutes - scheduledMovie.startMinutes;

  const minutesOnCurrentDay = 24 * 60 - scheduledMovie.startMinutes;
  const minutesOnNextDay = originalDuration - minutesOnCurrentDay;

  const result = {
    isValid: true,
    schedules: {},
    message: "",
  };

  const nextDayIndex = (currentDay + 1) % totalDays;

  // Create first part (on current day)
  const firstPart = {
    ...scheduledMovie,
    endMinutes: 24 * 60, 
    isMidnightPassed: true, 
    actualDuration: originalDuration, 
    originalDuration: originalDuration, 
  };

  // Create second part (on next day)
  const secondPart = {
    ...scheduledMovie,
    id: scheduledMovie.id + 1000000, 
    startMinutes: 0,
    endMinutes: minutesOnNextDay, 
    isContinuation: true,
    originalId: scheduledMovie.id, 
    actualDuration: originalDuration, 
    originalDuration: originalDuration, 
  };

  if (secondPart.endMinutes <= 0) {
    console.error("Invalid second part end time in cross-day scheduling", {
      originalDuration,
      minutesOnCurrentDay,
      calculatedEndMinutes: secondPart.endMinutes,
    });

    secondPart.endMinutes = 1;
    result.message = "Warning: Movie extends only slightly past midnight.";
  } else if (secondPart.endMinutes > 24 * 60) {
    console.error("Second part end time exceeds 24 hours", {
      originalDuration,
      minutesOnCurrentDay,
      calculatedEndMinutes: secondPart.endMinutes,
    });

    secondPart.endMinutes = 24 * 60;
    result.message = "Warning: Movie duration has been capped at 24 hours.";
  }

  const currentDayMovies = existingSchedules[currentDay] || [];
  const firstPartOverlap = checkScheduleOverlap(
    firstPart,
    currentDayMovies,
    true,
    scheduledMovie.id
  );

  const nextDayMovies = existingSchedules[nextDayIndex] || [];
  const secondPartOverlap = checkScheduleOverlap(
    secondPart,
    nextDayMovies,
    true
  );

  if (!firstPartOverlap.isValid) {
    result.isValid = false;
    result.message = `Conflict on current day: ${firstPartOverlap.message}`;
    return result;
  }

  if (!secondPartOverlap.isValid) {
    result.isValid = false;
    result.message = `Conflict on next day: ${secondPartOverlap.message}`;
    return result;
  }

  result.schedules[currentDay] = [...currentDayMovies, firstPart];
  result.schedules[nextDayIndex] = [...nextDayMovies, secondPart];

  return result;
};
