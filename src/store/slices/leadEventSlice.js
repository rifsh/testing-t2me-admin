import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LeadEventService from "services/LeadService";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  leadEvents: [],
  singleLeadEvent: null, // Added for storing a single event
  filteredLeadEvents: [],
  error: null,
  searchTerm: "",
  statusFilter: "All",
  eventDetails: {},
  responseData: null,
  responseMessage: null,
  filteredEvents: [],
  pagination: { size: 10, page: 1, total: 0, pages: 1 },
  // Add message-related state
  messages: [],
  messagesLoading: false,
  messagesError: null,
  responseImpactData: null,
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
      return rejectWithValue(
        error.message || "Failed to fetch lead event details"
      );
    }
  }
);

export const addLeadEvent = createAsyncThunk(
  "leadEvents/addLeadEvent",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.addLeadEvent(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);

export const fetchAllEvent = createAsyncThunk(
  "leadEvents/fetchAllEvent",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.fetchAllLeadEvent(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

export const fetchLeadEventDetails = createAsyncThunk(
  "event/fetchLeadEventDetails",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.fetchLeadEventDetails(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

export const fetchEventMessages = createAsyncThunk(
  "leadEvents/fetchEventMessages",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.fetchLeadEventMessage(eventId);
      console.log("Event messages fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Event messages fetch failed", error);
      return rejectWithValue(error.message || "Failed to fetch event messages");
    }
  }
);

export const sendEventMessage = createAsyncThunk(
  "leadEvents/sendEventMessage",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.sendLeadEventMessage(data);
      return response;
    } catch (error) {
      console.error("Failed to send message", error);
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);
export const EnrollUser = createAsyncThunk(
  "leadEvents/EnrollUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.EnrollUser(data);
      return response;
    } catch (error) {
      console.error("Failed to enroll user", error);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const editLeadEvent = createAsyncThunk(
  "leadEvents/editLeadEvent",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await LeadEventService.updateEvent(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const leadEventSlice = createSlice({
  name: "leadEvents",
  initialState,
  reducers: {
    filterEvent: (state, action) => {
      const { searchTerm, status } = action.payload;

      let event = state.events;
      if (status && status !== "All") {
        event = event.filter(
          (offer) =>
            (status === "Active" && offer.status === true) ||
            (status === "Inactive" && offer.status === false)
        );
      }

      if (searchTerm) {
        event = event.filter((offer) =>
          offer.event_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredEvents = event;
    },
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
    clearMessages: (state) => {
      state.messages = [];
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
      })

      .addCase(addLeadEvent.pending, (state) => {
        console.log("addLeadEvent - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addLeadEvent.fulfilled, (state, action) => {
        console.log("addLeadEvent - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addLeadEvent.rejected, (state, action) => {
        console.error("addLeadEvent - Rejected", action.payload);
        state.loading = false;
        state.error = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })

      .addCase(fetchAllEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.items;
        state.filteredEvents = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchLeadEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        const eventData = { ...action.payload[0] };

        const uniqueOffers = eventData.event_offers.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item) => item.offer.id === current.offer.id
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        const uniqueCoupons = eventData.event_coupons.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item) => item.coupons.id === current.coupons.id
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        eventData.event_offers = uniqueOffers;
        eventData.event_coupons = uniqueCoupons;

        state.eventDetails = eventData;
      })
      .addCase(fetchLeadEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchEventMessages cases
      .addCase(fetchEventMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchEventMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchEventMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload;
      })

      // Handle sendEventMessage cases
      .addCase(sendEventMessage.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(sendEventMessage.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // Add the new message to the messages array
        state.messages.push(action.payload);
      })
      .addCase(sendEventMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload;
      })
      .addCase(editLeadEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(editLeadEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.messages = payload.status.message;
          state.editable_status = payload.status?.editable_status;
        }
      })
      .addCase(editLeadEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(EnrollUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(EnrollUser.fulfilled, (state, action) => {
        state.loading = false;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(EnrollUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
;
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  filterLeadEvents,
  clearMessages,
} = leadEventSlice.actions;
export default leadEventSlice.reducer;
