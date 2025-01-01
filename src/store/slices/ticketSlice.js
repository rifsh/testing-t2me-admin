import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ENABLE_MOCK_API,
  GET_TICKET_MOCK_API,
  GET_TICKET_TYPE_MOCK_API,
} from "configs/MockConfig";
import TicketMockData from "mock/data/ticketData";
import { act } from "react";
import TicketsService from "services/TicketService";

export const initialState = {
  loading: false,
  error: null,
  searchTerm: "",
  statusFilter: "All",
  filteredTickets: [],
  placeId: null,
  venueId: null,
  availableTicketTyps: [],
  selectedTicketType: null,
  selectedTicketStructure: null,
  availableTicketSets: [],
  selectedTicketSet: null,
  currentStepSaved: false,
  isModalVisible: false,
  ticketTypes: [],
  message: null,
  editable_status: null,
  responseData: null,
  responseMessage: null,
  pagination: { size: 10, page: 1 },
  editable_status: null,
};

export const fetchAllTickets = createAsyncThunk(
  "ticket/fetchAllTickets",
  async (pageData, { rejectWithValue, getState }) => {
    try {
      if (GET_TICKET_MOCK_API && ENABLE_MOCK_API) {
        const response = TicketMockData.getAllTickets;
        return response.data;
      } else {
        const response = await TicketsService.getAllTickets(pageData);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching tickets");
    }
  }
);

export const addTicket = createAsyncThunk(
  "ticket/addTicket",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await TicketsService.addTicket(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating ticket");
    }
  }
);

export const getAvailableTicketsType = createAsyncThunk(
  "ticket/fetchAvailableTicketsType",
  async (_, { rejectWithValue }) => {
    try {
      if (GET_TICKET_TYPE_MOCK_API && ENABLE_MOCK_API) {
        const response = TicketMockData.getAvailableTicketTyps;
        return response.data;
      } else {
        const response = await TicketsService.getAvailableTicketsType();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching ticket types"
      );
    }
  }
);
export const editTicket = createAsyncThunk(
  "ticket/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await TicketsService.editTicket(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    filterTickets(state, { payload: { searchTerm, status } }) {
      let filteredTickets = state.filteredTickets;

      if (status && status !== "All") {
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            (status === "Active" && ticket.status === true) ||
            (status === "Inactive" && ticket.status === false)
        );
      }
      if (searchTerm) {
        filteredTickets = filteredTickets.filter((ticket) =>
          ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      state.filteredTickets = filteredTickets;
    },

    setSelectedVenue(state, action) {
      state.selectedVenue = action.payload;
    },
    setIsModalVisible(state, action) {
      state.isModalVisible = action.payload;
    },
    setSelectedTicketType(state, action) {
      console.log("Setting selected ticket type:", action.payload);
      state.selectedTicketType = action.payload;
    },

    addOrUpdateTicketSet(state, action) {
      const {
        venue_id,
        place_id,
        number_of_tickets,
        name,
        base_price,
        ticket_set,
        tickets,
        id,
      } = action.payload;
      console.log(state, ticket_set, tickets, "Saving Ticket Set");

      if (venue_id && number_of_tickets && base_price) {
        // First time adding venue data and ticket set
        if (state.ticketTypes.length === 0) {
          state.ticketTypes.push({
            venue_id,
            number_of_tickets,
            name,
            base_price,
            place_id,
            ticket_types: [],
          });
        }
      } else {
        // Subsequent times: Add new ticket set (ticket types only)
        const existingTicketSetIndex =
          state.ticketTypes[0]?.ticket_types.findIndex((set) => set.id === id);

        if (existingTicketSetIndex !== -1) {
          // If the ticket set already exists, update it
          state.ticketTypes[0].ticket_types[existingTicketSetIndex] = {
            ticket_set,
            tickets,
            id,
          };
        } else {
          // Otherwise, add the new ticket set
          state.ticketTypes[0].ticket_types.push({ ticket_set, tickets, id });
        }
      }
    },

    removeSpecificTicketSet(state, action) {
      const ticketSetToRemove = action.payload; // Name of the ticket_set to remove

      if (state.ticketTypes.length > 0 && state.ticketTypes[0]?.ticket_types) {
        state.ticketTypes[0].ticket_types =
          state.ticketTypes[0].ticket_types.filter(
            (set) => set.id !== ticketSetToRemove
          );
      }
    },
    // Reset all ticket sets
    currentStepSaveUpdate(state, action) {
      state.currentStepSaved = action.payload;
    },
    resetTicketSets(state) {
      state.ticketTypes = [];
    },
    resetTicketTypes(state) {
      if (state.ticketTypes.length > 0) {
        state.ticketTypes[0].ticket_types = []; // Reset ticket_types to an empty array
      }
    },
    setSelectedTicketType(state, action) {
      state.selectedTicketType = action.payload;
      // Reset related states when ticket type changes
      state.selectedTicketStructure = null;
      state.availableTicketSets = [];
      state.selectedTicketSet = null;
    },
    setSelectedTicketStructure(state, action) {
      const selectedStructure = action.payload;
      state.selectedTicketStructure = selectedStructure;

      // Extract ticket types from the selected structure
      state.availableTicketSets = selectedStructure?.ticket_types || [];

      // Reset ticket set selection
      state.selectedTicketSet = null;
    },
    setSelectedTicketSet(state, action) {
      const selectedSet = state.availableTicketSets.find(
        (set) => set.ticket_set === action.payload
      );
      state.selectedTicketSet = selectedSet || null;
    },
    resetTicketSelection(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.warn("payload", payload);
        state.filteredTickets = payload[0].items;
        state.pagination = payload;
        state.editable_status = payload.editable_status;
      })
      .addCase(fetchAllTickets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getAvailableTicketsType.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAvailableTicketsType.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.availableTicketTyps = payload[0];
      })
      .addCase(getAvailableTicketsType.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        console.error(action.payload.data);
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setPlaceId,
  setVenueId,
  filterTickets,
  setSelectedVenue,
  resetTicketTypes,
  setIsModalVisible,
  setSelectedTicketType,
  setSelectedTicketStructure,
  setSelectedTicketSet,
  resetTicketSelection,
  removeSpecificTicketSet,
  currentStepSaveUpdate,
  addOrUpdateTicketSet,
  resetTicketSets,
} = ticketSlice.actions;

export const selectTickets = (state) => state.tickets;

export default ticketSlice.reducer;
