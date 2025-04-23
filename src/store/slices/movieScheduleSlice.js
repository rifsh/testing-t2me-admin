import dayjs from "dayjs";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MovieScheduleService from "services/MovieScheduleService";
const initialState = {
  scheduledMovies: {},
  dateRange: [],
  selectedDate: dayjs().format("YYYY-MM-DD"),
  selectedMovieId: null,
  isDetailsOpen: false,
  seatStructure: null,
  coupons: {},
  offers: {},
  seatStructures: {},
  intervalTimes: {},
  bookingStartDates: {},
  initialBookingStartDate: null,
  activeTab: 0,
  dateRangeLength: 7,
  showLengthOptions: false,
  availableMovies: [],

  //api state
  allSchedule: [],
  singleSchedule: null,
  //common api state
  loading: false,
  error: null,
  message: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  validationStatus: false,
  pagination: { size: 10, page: 1 },
  editSeatItemId: null,
  responseImpactData: null,
  warningPagination: { size: 10, page: 1 },
  submitPagination: { size: 10, page: 1 },
};

export const addMovieSchedule = createAsyncThunk(
  "movieSchedule/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieScheduleService.addMovieSchedule(
        data,
        action
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating seat structure"
      );
    }
  }
);

export const editSeatStructure = createAsyncThunk(
  "movieSchedule/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieScheduleService.editSeatStructure(
        data,
        action
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure"
      );
    }
  }
);

export const editSeatStructureStatus = createAsyncThunk(
  "movieSchedule/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await MovieScheduleService.editSeatStructureStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure status"
      );
    }
  }
);

export const getMovieScheduleDetails = createAsyncThunk(
  "movieSchedule/getDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieScheduleService.getScheduleDetails(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching seat structure details"
      );
    }
  }
);

export const getAllMovieSchedule = createAsyncThunk(
  "movieSchedule/getAllSchedule",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieScheduleService.getAllMovieSchedule(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching all seat structure"
      );
    }
  }
);

const movieScheduleSlice = createSlice({
  name: "movieSchedule",
  initialState,
  reducers: {
    resetState: () => ({
      ...initialState,
    }),
    setBookingStartDate: (state, action) => {
      const { movieId, bookingStartDate } = action.payload;
      state.bookingStartDates[movieId] = bookingStartDate;
    },
    setInitialBookingStartDate: (state, action) => {
      state.initialBookingStartDate = action.payload;
    },
    setavailableMovies: (state, action) => {
      state.availableMovies = action.payload;
    },
    resetSchedules: (state) => {
      state.scheduledMovies = {};
      state.coupons = {};
      state.offers = {};
      state.seatStructures = {};
      state.intervalTimes = {};
      state.selectedMovieId = null;
      state.isDetailsOpen = false;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDateRangeLength: (state, action) => {
      state.dateRangeLength = action.payload;
    },

    setShowLengthOptions: (state, action) => {
      state.showLengthOptions = action.payload;
    },

    // Handle scheduling movies - accept the entire updated scheduledMovies object
    scheduleMovie: (state, action) => {
      state.scheduledMovies = action.payload;
    },

    // Legacy reducer for scheduling a single movie
    scheduleMovieSingle: (state, action) => {
      const { date, movieData } = action.payload;

      // Initialize the date if it doesn't exist
      if (!state.scheduledMovies[date]) {
        state.scheduledMovies[date] = [];
      }

      // Check for conflicts
      const conflicts = state.scheduledMovies[date].some((movie) => {
        if (movie.screen !== movieData.screen) return false;

        // Check if the new movie overlaps with an existing one
        return (
          movieData.startMinutes < movie.endMinutes &&
          movieData.endMinutes > movie.startMinutes
        );
      });

      if (!conflicts) {
        state.scheduledMovies[date].push(movieData);
      }
    },

    // Update scheduled movie reducer
    updateScheduledMovie: (state, action) => {
      const { date, updatedMovie } = action.payload;

      if (state.scheduledMovies[date]) {
        state.scheduledMovies[date] = state.scheduledMovies[date].map((movie) =>
          movie.id === updatedMovie.id ? updatedMovie : movie
        );
      }
    },

    // Remove scheduled movie reducer
    removeScheduledMovie: (state, action) => {
      const { date, movieId } = action.payload;

      if (state.scheduledMovies[date]) {
        state.scheduledMovies[date] = state.scheduledMovies[date].filter(
          (movie) => movie.id !== movieId
        );
      }
    },

    // Set selected movie (for detail view)
    setSelectedMovie: (state, action) => {
      state.selectedMovieId = action.payload;
    },

    // Toggle detail drawer/modal
    toggleDetailsOpen: (state, action) => {
      state.isDetailsOpen =
        action.payload !== undefined ? action.payload : !state.isDetailsOpen;
    },

    // Update seat structure
    updateSeatStructure: (state, action) => {
      state.seatStructure = action.payload;
    },

    // Set coupons for a scheduled movie (as a list)
    setCoupons: (state, action) => {
      const { movieId, couponIds } = action.payload;
      state.coupons[movieId] = couponIds;
    },

    // Set offers for a scheduled movie (as a list)
    setOffers: (state, action) => {
      const { movieId, offerIds } = action.payload;
      state.offers[movieId] = offerIds;
    },

    // Set seat structure for a scheduled movie
    setSeatStructure: (state, action) => {
      const { movieId, seatStructureId } = action.payload;
      state.seatStructures[movieId] = seatStructureId;
    },

    // Set interval time for a scheduled movie
    setIntervalTime: (state, action) => {
      const { movieId, intervalTime } = action.payload;
      state.intervalTimes[movieId] = intervalTime;
    },

    setDateRange: (state, action) => {
      state.dateRange = action.payload;

      // If the current selectedDate is not within the new dateRange, update it
      if (state.selectedDate) {
        const selectedDateObj = dayjs(state.selectedDate);
        const startDate = dayjs(action.payload[0]);
        const endDate = dayjs(action.payload[1]);

        if (
          selectedDateObj.isBefore(startDate) ||
          selectedDateObj.isAfter(endDate)
        ) {
          state.selectedDate = startDate;
        }
      } else if (action.payload && action.payload.length > 0) {
        // If no date was selected, default to the start date
        state.selectedDate = action.payload[0];
      }
    },

    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add seat structure cases
      .addCase(addMovieSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addMovieSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error creating seat structure";
      })

      // Edit seat structure cases
      .addCase(editSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSeatStructure.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error updating seat structure";
      })

      // Edit seat structure status cases
      .addCase(editSeatStructureStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSeatStructureStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSeatStructureStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error updating seat structure status";
      })

      // Get seat structure details cases
      .addCase(getMovieScheduleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieScheduleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.singleSchedule = action.payload[0];
      })
      .addCase(getMovieScheduleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat structure details";
      })
      .addCase(getAllMovieSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMovieSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allSchedule = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getAllMovieSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat all structure";
      });
  },
});

// Export actions
export const {
  setActiveTab,
  resetState,
  scheduleMovie,
  scheduleMovieSingle,
  updateScheduledMovie,
  setavailableMovies,
  removeScheduledMovie,
  setSelectedMovie,
  toggleDetailsOpen,
  updateSeatStructure,
  setCoupons,
  setOffers,
  setSeatStructure,
  setIntervalTime,
  setDateRange,
  setSelectedDate,
  setDateRangeLength,
  setShowLengthOptions,
  setBookingStartDate,
  setInitialBookingStartDate,
  resetSchedules,
} = movieScheduleSlice.actions;

export default movieScheduleSlice.reducer;
