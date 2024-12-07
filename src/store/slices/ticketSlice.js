import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ENABLE_MOCK_API,
  GET_TICKET_MOCK_API,
} from "configs/MockConfig";
import TicketsService from "services/TicketService";

// Initial state for tickets
export const initialState = {
  loading: false,
  error: null,
  searchTerm: "",
  statusFilter: "All",
  filteredTickets: [],
};

export const fetchAllTickets = createAsyncThunk(
  "ticket/fetchAllTickets",
  async (_, { rejectWithValue }) => {
    try {
      if (GET_TICKET_MOCK_API && ENABLE_MOCK_API) {
        const response = TicketsService.getAllTickets; // Use the correct mock response if enabled
        return response.data;
      } else {
        const response = await TicketsService.getAllTickets(); // Fetch tickets from the actual API
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching tickets");
    }
  }
);

export const addTicket = createAsyncThunk(
  "ticket/addTicket",
  async ({ ticketData, venue_id }, { rejectWithValue }) => {
    try {
      const response = await TicketsService.addTicket(ticketData, venue_id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating ticket");
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
    filterTickets(state, action) {
      const { searchTerm, status } = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.filteredTickets = payload;
      })
      .addCase(fetchAllTickets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.filteredTickets.push(payload); 
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
} = ticketSlice.actions;

export const selectTickets = (state) => state.tickets;

export default ticketSlice.reducer;
