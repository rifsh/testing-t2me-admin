import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LeadEventService from "services/LeadService";

export const initialState = {
  loading: false,
  leadEvents: [],
  singleLeadEvent: null, // Added for storing a single event
  filteredLeadEvents: [],
  error: null,
  searchTerm: "",
  statusFilter: "All",
  pagination: { size: 10, page: 1, total: 0, pages: 1 },
};

// Fetch all lead events
export const getLeadEvents = createAsyncThunk(
  "leadEvents/getLeadEvents",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.getleadEvent(pageData);
      console.log("Lead events fetched:", response.data[0]);
      return response.data[0];
    } catch (error) {
      console.error("Lead events fetch failed", error);
      return rejectWithValue(error.message || "Failed to fetch lead events");
    }
  }
);

// Fetch a single lead event by ID
export const getSingleLeadEvents = createAsyncThunk(
  "leadEvents/getSingleLeadEvents",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.getSingleleadEvent(eventId);
      
      if (!response?.data) {
        return rejectWithValue("No data available for this event");
      }

      return response.data[0];
    } catch (error) {
      console.error("Error fetching single lead event:", error);
      return rejectWithValue(error.message || "Failed to fetch lead event details");
    }
  }
);

const leadEventSlice = createSlice({
  name: "leadEvents",
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    filterLeadEvents: (state, action) => {
      const { searchTerm, status } = action.payload;
      let filteredLeadEvents = state.leadEvents;

      // Status filter
      if (status && status !== "All") {
        filteredLeadEvents = filteredLeadEvents.filter(
          (event) =>
            (status === "Active" && event.place?.status === true) ||
            (status === "Inactive" && event.place?.status === false)
        );
      }

      // Search term filter based on event_name
      if (searchTerm) {
        filteredLeadEvents = filteredLeadEvents.filter((event) =>
          event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredLeadEvents = filteredLeadEvents;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getLeadEvents cases
      .addCase(getLeadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.leadEvents = action.payload.items;
        state.filteredLeadEvents = action.payload.items;
        state.pagination = {
          page: action.payload.page || 1,
          size: action.payload.size || 10,
          total: action.payload.total || 0,
          pages: action.payload.pages || 1,
        };
      })
      .addCase(getLeadEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle getSingleLeadEvents cases
      .addCase(getSingleLeadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleLeadEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.singleLeadEvent = action.payload; // Store the fetched single event details
      })
      .addCase(getSingleLeadEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setStatusFilter, filterLeadEvents } = leadEventSlice.actions;
export default leadEventSlice.reducer;
