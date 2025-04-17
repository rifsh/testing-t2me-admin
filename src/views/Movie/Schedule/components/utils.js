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
    if (!movies || !movies.items) {
      return [];
    }

    return movies.items.reduce((acc, item) => {
      if (!item || !item.movie_details || !Array.isArray(item.movie_details)) {
        return acc;
      }

      const movieDetails = item.movie_details.map((detail) => ({
        id: item.id,
        title: item.event_name || "Untitled",
        description: item.description || "",
        thumbnail_image: item.thumbnail_image || "",
        genre: detail.genre || "",
        language: detail.language || "",
        country: detail.country || "",
        director: detail.director || "",
        released: detail.released || "",
        rating: detail.rating || "",
        runtime: parseInt(detail.runtime, 10) || 90, 
        duration: parseInt(detail.runtime, 10) || 90, // Add duration field explicitly
        image: item.thumbnail_image || "", // Add image field explicitly
        color: getRandomColor(item.id), // Generate a color based on movie ID
        media_items: detail.media_items || [],
        casts: detail.casts || [],
        awards: detail.awards || "",
        box_office: detail.box_office || "",
        box_office_currency: detail.box_office_currency || "",
        budget: detail.budget || "",
        budget_currency: detail.budget_currency || "",
        production_company: detail.production_company || "",
        status: item.status || "",
      }));

      return [...acc, ...movieDetails];
    }, []);
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
              ...screen 
            });
          }
        });
      }
    });
  
    return allScreens;
  };