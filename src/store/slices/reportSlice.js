import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ReportService from "../../services/AdminReportService";

export const fetchReports = createAsyncThunk(
  "report/fetchReports",
  async ({ pageData, contentType, countryId }, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchReports(
        pageData,
        contentType,
        countryId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  "report/fetchUserReports",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchUserReports(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  "report/fetchUserDetails",
  async ({ userId, countryId }, { rejectWithValue }) => {
    // Destructure params
    try {
      if (!userId) {
        throw new Error("Missing required parameters");
      }
      const response = await ReportService.fetchUserDetails(userId, countryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchEventListing = createAsyncThunk(
  "report/fetchEventListing",
  async (pageData, { rejectWithValue }) => {
    // Destructure params
    try {
      if (!pageData) {
        throw new Error("Missing required parameters");
      }
      const response = await ReportService.fetchEventList(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchUserTheaters = createAsyncThunk(
  "report/fetchUserTheaters",
  async ({ userId, countryId }, { rejectWithValue }) => {
    // Destructure params
    try {
      if (!userId) {
        throw new Error("Missing required parameters");
      }
      const response = await ReportService.fetchUserTheaters(userId, countryId);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  "report/fetchEventDetails",
  async ({ eventId, countryId }, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchEventDetails(
        eventId,
        countryId
      );
      console.log(response, "res");

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchMovieUserDetails = createAsyncThunk(
  "report/fetchMovieUserDetails",
  async ({ userId, countryId }, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchMovieUserDetails(
        userId,
        countryId
      );
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchTheaterDetails = createAsyncThunk(
  "report/fetchTheaterDetails",
  async (theaterId, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchTheaterDetails(theaterId);
      console.log(response, "res");

      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchMovieList = createAsyncThunk(
  "report/fetchMovieList",
  async (pageData ,{ rejectWithValue }) => {
    try {
      const response = await ReportService.fetchMovieList(pageData);
      console.log(response, "res");

      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchMovieDetails = createAsyncThunk(
  "report/fetchMovieDetails",
  async ({ movieId, theaterId }, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchMovieDetails(
        movieId,
        theaterId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchCountryList = createAsyncThunk(
  "report/fetchCountryList",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchCountryList(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

//export

export const fetchReportsExport = createAsyncThunk(
  "report/fetchReporExport",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchUserReports(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState: {
    reportData: null,
    loading: false,
    error: null,
    userReports: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },
    countryList: {
      data: null,
      loading: false,
      error: null,

      selectedCountry: null,
    },
    userDetails: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },
    userTheaters: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },

    eventListing: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },
    eventDetails: {
      data: null,
      loading: false,
      error: null,
    },
    movieUserDetails: {
      data: null,
      loading: false,
      error: null,
    },
    theaterDetails: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },
    movieList: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 5, page: 1 },
    },

    movieDetails: {
      data: null,
      loading: false,
      error: null,
    },
  },
  reducers: {
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        console.log("Redux slice got payload:", action.payload);
        state.loading = false;
        state.reportData = action.payload?.[0] || null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // report - users listing

      .addCase(fetchUserReports.pending, (state) => {
        state.userReports.loading = true;
        state.userReports.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.userReports.loading = false;
        state.userReports.data = action.payload || null;
        console.log("action.payload", action.payload);
        state.userReports.pagination = action.payload;
      })

      .addCase(fetchUserReports.rejected, (state, action) => {
        state.userReports.loading = false;
        state.userReports.error = action.payload || action.error.message;
      })

      //event-user-details

      .addCase(fetchUserDetails.pending, (state) => {
        state.userDetails.loading = true;
        state.userDetails.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetails.loading = false;
        state.userDetails.data = action.payload || null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userDetails.loading = false;
        state.userDetails.error = action.payload || action.error.message;
      })

      .addCase(fetchEventListing.pending, (state) => {
        state.eventListing.loading = true;
        state.eventListing.error = null;
      })
      .addCase(fetchEventListing.fulfilled, (state, action) => {
        state.eventListing.loading = false;
        state.eventListing.data = action.payload || null;
        state.eventListing.pagination = action.payload;
      })
      .addCase(fetchEventListing.rejected, (state, action) => {
        state.eventListing.loading = false;
        state.eventListing.error = action.payload || action.error.message;
      })

      //user theaters

      .addCase(fetchUserTheaters.pending, (state) => {
        state.userTheaters.loading = true;
        state.userTheaters.error = null;
      })
      .addCase(fetchUserTheaters.fulfilled, (state, action) => {
        state.userTheaters.loading = false;
        state.userTheaters.data = action.payload || null;
        console.log("action.payload", action.payload);

        state.userTheaters.pagination = action.payload;
      })
      .addCase(fetchUserTheaters.rejected, (state, action) => {
        state.userTheaters.loading = false;
        state.userTheaters.error = action.payload || action.error.message;
      })

      //event details

      .addCase(fetchEventDetails.pending, (state) => {
        state.eventDetails.loading = true;
        state.eventDetails.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.eventDetails.loading = false;
        state.eventDetails.data = action.payload || null;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.eventDetails.loading = false;
        state.eventDetails.error = action.payload || action.error.message;
      })

      // movies-user-details

      .addCase(fetchMovieUserDetails.pending, (state) => {
        state.movieUserDetails.loading = true;
        state.movieUserDetails.error = null;
      })
      .addCase(fetchMovieUserDetails.fulfilled, (state, action) => {
        state.movieUserDetails.loading = false;
        state.movieUserDetails.data = action.payload || null;
        state.movieUserDetails.pagination = action.payload;
      })
      .addCase(fetchMovieUserDetails.rejected, (state, action) => {
        state.movieUserDetails.loading = false;
        state.movieUserDetails.error = action.payload || action.error.message;
      })

      //theater details

      .addCase(fetchTheaterDetails.pending, (state) => {
        state.theaterDetails.loading = true;
        state.theaterDetails.error = null;
      })
      .addCase(fetchTheaterDetails.fulfilled, (state, action) => {
        state.theaterDetails.loading = false;
        state.theaterDetails.data = action.payload || null;
        state.theaterDetails.pagination = action.payload;
      })
      .addCase(fetchTheaterDetails.rejected, (state, action) => {
        state.theaterDetails.loading = false;
        state.theaterDetails.error = action.payload || action.error.message;
      })

      .addCase(fetchMovieList.pending, (state) => {
        state.movieList.loading = true;
        state.movieList.error = null;
      })
      .addCase(fetchMovieList.fulfilled, (state, action) => {
        state.movieList.loading = false;
        state.movieList.data = action.payload || null;
        state.movieList.pagination = action.payload;
      })
      .addCase(fetchMovieList.rejected, (state, action) => {
        state.movieList.loading = false;
        state.movieList.error = action.payload || action.error.message;
      })

      //movie detail

      .addCase(fetchMovieDetails.pending, (state) => {
        state.movieDetails.loading = true;
        state.movieDetails.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.movieDetails.loading = false;
        state.movieDetails.data = action.payload || null;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.movieDetails.loading = false;
        state.movieDetails.error = action.payload || action.error.message;
      })

      //country list

      .addCase(fetchCountryList.pending, (state) => {
        state.countryList.loading = true;
        state.countryList.error = null;
      })
      .addCase(fetchCountryList.fulfilled, (state, action) => {
        state.countryList.loading = false;
        state.countryList.data = action.payload || null;

        // if (action.payload?.[0]?.pagination) {
        //   state.countryList.pagination = {
        //     ...state.countryList.pagination,
        //     current: action.payload[0].pagination.page,
        //     pageSize: action.payload[0].pagination.size,
        //     total: action.payload[0].pagination.total,
        //   };
        // }
      })

      .addCase(fetchCountryList.rejected, (state, action) => {
        state.countryList.loading = false;
        state.countryList.error = action.payload || action.error.message;
      });
  },
});
export const { setSelectedCountry } = reportSlice.actions;
export default reportSlice.reducer;
