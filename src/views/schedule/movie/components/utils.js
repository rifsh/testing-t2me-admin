import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SCHEDULE_ERROR_MESSAGES } from "./constants";
import { message } from "antd";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const validateScheduleTimeWithTimezone = (
  startMinutes,
  venueTimezone,
  tabIndex,
  dateRange
) => {
  // If no timezone provided, assume valid
  if (!venueTimezone) {
    return { isValid: true };
  }

  // Get the current time in venue's timezone
  const currentVenueTime = dayjs().tz(venueTimezone);

  // Convert start minutes to hours and minutes
  const scheduledHour = Math.floor(startMinutes / 60);
  const scheduledMinute = startMinutes % 60;

  // Get the selected date for this tab
  let selectedDate;
  if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    // If date range is provided, use it to determine the selected date
    selectedDate = dayjs(dateRange[0]).add(tabIndex, "day");
  } else {
    // Fallback - use current date + tab index
    selectedDate = dayjs().add(tabIndex, "day");
  }

  const scheduledDateTime = dayjs.tz(
    `${selectedDate.format("YYYY-MM-DD")} ${scheduledHour
      .toString()
      .padStart(2, "0")}:${scheduledMinute.toString().padStart(2, "0")}`,
    "YYYY-MM-DD HH:mm",
    venueTimezone
  );

  const isToday =
    currentVenueTime.format("YYYY-MM-DD") ===
    scheduledDateTime.format("YYYY-MM-DD");
  if (isToday && scheduledDateTime.isBefore(currentVenueTime)) {
    return {
      isValid: false,
      message: `Cannot schedule before current time (${currentVenueTime.format(
        "HH:mm"
      )}) in ${venueTimezone}`,
    };
  }

  return { isValid: true };
};

// Modify checkScheduleOverlap to include time zone validation
export const checkScheduleOverlapWithTimezone = (
  movieToCheck,
  existingMovies,
  isEditing = false,
  editingId = null,
  venueTimezone = null,
  activeTab = 0,
  dateRange = null
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

  // Validate time zone if provided
  if (venueTimezone) {
    const timeValidation = validateScheduleTimeWithTimezone(
      movieToCheck.startMinutes,
      venueTimezone,
      activeTab,
      dateRange
    );

    if (!timeValidation.isValid) {
      return timeValidation;
    }
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

// Helper function to get the actual date for a specific tab
export const getDateForTab = (activeTab, dateRange) => {
  // If we have a dateRange, use it to determine the actual date
  if (dateRange && dateRange.length === 2 && dateRange[0]) {
    const startDate = dayjs(dateRange[0]);
    return startDate.add(activeTab, "day");
  }

  // Fallback: use current date + activeTab days
  return dayjs().add(activeTab, "day");
};
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
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#d35400",
    "#34495e",
    "#16a085",
    "#c0392b",
  ];
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

export const restructureForAPI = (formValue, scheduledMovies) => {
  // Validation result object
  const validationResult = {
    isValid: true,
    message: "",
    details: {},
    data: null,
  };

  const formFields = formValue;
  const startDate = dayjs(formFields.start_date).format("YYYY-MM-DD");
  const endDate = dayjs(formFields.end_date).format("YYYY-MM-DD");
  const bookingStartDateTime = dayjs(formFields.booking_start_date);

  // Step 1: Check for movies without seat structures
  const missingSeats = [];
  let currentDate = dayjs(startDate);
  while (!currentDate.isAfter(dayjs(endDate), "day")) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    const dayIndex = currentDate.diff(dayjs(startDate), "day");
    const moviesForDay = scheduledMovies[dayIndex] || [];

    moviesForDay.forEach((movie) => {
      if (!movie.seatStructureId) {
        missingSeats.push({
          date: dateStr,
          movieName: movie.title || `Movie ID: ${movie.movieId}`,
        });
      }
    });

    currentDate = currentDate.add(1, "day");
  }

  // Return early if seat structures are missing
  if (missingSeats.length > 0) {
    const missingList = missingSeats
      .map((item) => `Date: ${item.date} - ${item.movieName}`)
      .join("\n");

    validationResult.isValid = false;
    validationResult.message = "Missing seat structure";
    validationResult.details = {
      title: "Missing Seat Structure",
      content: `Seat structure not selected for:\n${missingList}`,
      affectedItems: missingSeats,
    };

    return validationResult;
  }

  // Step 2: Check for empty dates
  const validDatesWithMovies = [];
  const emptyDates = [];
  const emptyGapDates = []; // New array to track empty dates between scheduled dates

  currentDate = dayjs(startDate);
  while (!currentDate.isAfter(dayjs(endDate), "day")) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    const dayIndex = currentDate.diff(dayjs(startDate), "day");
    const moviesForDay = scheduledMovies[dayIndex] || [];

    if (moviesForDay.length > 0) {
      validDatesWithMovies.push(dateStr);
    } else {
      emptyDates.push(dateStr);
    }

    currentDate = currentDate.add(1, "day");
  }

  // Return early if all dates are empty
  if (validDatesWithMovies.length === 0) {
    validationResult.isValid = false;
    validationResult.message = "No scheduled movies";
    validationResult.details = {
      title: "No Schedule Found",
      content: "No scheduled movies found for any date!",
    };

    return validationResult;
  }

  // Identify empty dates at the beginning and end vs. gaps in the middle
  const firstScheduledDate = validDatesWithMovies[0];
  const lastScheduledDate =
    validDatesWithMovies[validDatesWithMovies.length - 1];

  const emptyEdgeDates = []; // Dates before first or after last scheduled date

  // Separate empty dates into edge dates and gap dates
  emptyDates.forEach((date) => {
    if (date < firstScheduledDate || date > lastScheduledDate) {
      emptyEdgeDates.push(date);
    } else {
      emptyGapDates.push(date);
    }
  });

  // Prepare messages about empty dates
  let emptyDatesMessage = "";

  // Handle edge empty dates (beginning and end)
  if (emptyEdgeDates.length > 0) {
    emptyDatesMessage += `The following dates have no scheduled movies and will be removed: ${emptyEdgeDates.join(
      ", "
    )}\n\n`;
  }

  // Handle gap empty dates (between scheduled dates)
  if (emptyGapDates.length > 0) {
    emptyDatesMessage += `The following dates between your scheduled dates have no movies: ${emptyGapDates.join(
      ", "
    )}\n`;
    emptyDatesMessage += `These dates will be considered as part of your schedule. You can add movies to these dates later by editing this schedule, or continue with gaps in your schedule.`;
  }

  // Return warning about empty dates if any exist
  if (emptyEdgeDates.length > 0 || emptyGapDates.length > 0) {
    validationResult.isValid = true;
    validationResult.message = "Empty dates found";
    validationResult.details = {
      title: "Empty Dates Found",
      content: emptyDatesMessage,
      emptyEdgeDates: emptyEdgeDates,
      emptyGapDates: emptyGapDates,
    };
    // Continue processing with this warning
  }

  // Update start and end dates to only include the range from first to last scheduled movie
  // (including any gaps between them)
  const newStartDate = firstScheduledDate;
  const newEndDate = lastScheduledDate;

  const movieShows = [];
  let firstMovieStart = null;
  let lastMovieEnd = null;

  // Process only dates between first and last scheduled date (inclusive)
  currentDate = dayjs(newStartDate);
  while (!currentDate.isAfter(dayjs(newEndDate), "day")) {
    const date = currentDate.format("YYYY-MM-DD");
    const dayIndex = currentDate.diff(dayjs(startDate), "day");
    const moviesForDay = scheduledMovies[dayIndex] || [];

    if (moviesForDay.length > 0) {
      moviesForDay.forEach((movie) => {
        // Skip movies without seat structure (already validated)
        if (!movie.seatStructureId) return;

        const startHour = Math.floor(movie.startMinutes / 60);
        const startMinute = movie.startMinutes % 60;
        const endHour = Math.floor(movie.endMinutes / 60);
        const endMinute = movie.endMinutes % 60;

        // Create start and end time
        const startTimeObj = dayjs(date)
          .hour(startHour)
          .minute(startMinute)
          .second(0);

        const endTimeObj = dayjs(date)
          .hour(endHour)
          .minute(endMinute)
          .second(0);

        const startTime = startTimeObj.format("HH:mm:ss.SSS[Z]");
        const endTime = endTimeObj.format("HH:mm:ss.SSS[Z]");

        if (
          firstMovieStart === null ||
          startTimeObj.isBefore(firstMovieStart)
        ) {
          firstMovieStart = startTimeObj;
        }

        if (lastMovieEnd === null || endTimeObj.isAfter(lastMovieEnd)) {
          lastMovieEnd = endTimeObj;
        }

        const duration = movie.endMinutes - movie.startMinutes;

        const screenId =
          movie.screen && typeof movie.screen === "object"
            ? movie.screen.id
            : movie.screenId || movie.screen;

        const offerIds = (movie.offers || []).map((offerId) => ({
          offer_id: offerId,
          valid_from: date,
          valid_to: date,
        }));

        const couponIds = (movie.coupons || []).map((couponId) => ({
          coupon_id: couponId,
          valid_from: date,
          valid_to: date,
        }));

        let bookingStartObj = movie.bookingStartDate
          ? dayjs(movie.bookingStartDate)
          : bookingStartDateTime;

        movieShows.push({
          screen_id: screenId,
          movie_id: movie.movieId,
          seat_structure_id: movie.seatStructureId,
          intervals: movie.intervals || 15,
          start_time: startTime,
          end_time: endTime,
          duration: duration,
          movie_date: date,
          booking_start_date: bookingStartObj.format("YYYY-MM-DD"),
          booking_start_time: bookingStartObj.format("HH:mm:ss.SSS[Z]"),
          is_online_ticket: movie.isOnlineTicket,
          offer_ids: offerIds,
          coupon_ids: couponIds,
        });
      });
    }

    currentDate = currentDate.add(1, "day");
  }

  const payload = {
    name: formFields.name,
    venue_id: formFields.venue_id,
    theatre_id: formFields.theatre_id?.value || formFields.theatre_id || null,
    start_date: newStartDate,
    end_date: newEndDate,
    start_time: firstMovieStart
      ? firstMovieStart.format("HH:mm:ss.SSS[Z]")
      : dayjs().format("HH:mm:ss.SSS[Z]"),
    end_time: lastMovieEnd
      ? lastMovieEnd.format("HH:mm:ss.SSS[Z]")
      : dayjs().format("HH:mm:ss.SSS[Z]"),
    movie_ids: formFields.movie || [],
    movie_show: movieShows,
  };

  validationResult.data = payload;

  return validationResult;
};
