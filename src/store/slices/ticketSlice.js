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
  selectedTicketTyps: null,
  // selectedVenue: null,
  currentStepSaved : false,
  isModalVisible: false,
  ticketTypes: [], 
};

export const fetchAllTickets = createAsyncThunk(
  "ticket/fetchAllTickets",
  async (venueId, { rejectWithValue, getState }) => {
   
    
    try {
      if (GET_TICKET_MOCK_API && ENABLE_MOCK_API) {
        const response = TicketMockData.getAllTickets;
        return response.data;
      } else {
        const response = await TicketsService.getAllTickets(venueId);
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
    console.warn(ticketData, venue_id,'..................')
    try {
      const response = await TicketsService.addTicket(ticketData, venue_id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating ticket");
    }
  }
);

export const getAvailableTicketsType = createAsyncThunk(
  "ticket/fetchAvailableTicketsType",
  async (_,  { rejectWithValue }) => {
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
      console.log('Setting selected ticket type:', action.payload);
      state.selectedTicketType = action.payload;
    },

   
    addOrUpdateTicketSet(state, action) {
      const { venue_id,place_id, number_of_tickets, name, base_price, ticket_set, tickets, id } = action.payload;
      console.log(state, ticket_set, tickets, 'Saving Ticket Set');
    
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
        const existingTicketSetIndex = state.ticketTypes[0]?.ticket_types.findIndex(
          (set) => set.id === id
        );
    
        if (existingTicketSetIndex !== -1) {
          // If the ticket set already exists, update it
          state.ticketTypes[0].ticket_types[existingTicketSetIndex] = { ticket_set, tickets, id };
        } else {
          // Otherwise, add the new ticket set
          state.ticketTypes[0].ticket_types.push({ ticket_set, tickets, id });
        }
      }
    }
    
      ,removeSpecificTicketSet(state, action) {
        const ticketSetToRemove = action.payload; // Name of the ticket_set to remove
      
        if (state.ticketTypes.length > 0 && state.ticketTypes[0]?.ticket_types) {
          state.ticketTypes[0].ticket_types = state.ticketTypes[0].ticket_types.filter(
            (set) => set.id !== ticketSetToRemove
          );
        }
      }
      ,
  
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
      }
      

  

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.filteredTickets = payload;
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
  setPlaceId,
  setVenueId,
  filterTickets,
  setSelectedVenue,
  resetTicketTypes,
  setIsModalVisible,
  removeSpecificTicketSet,
  setSelectedTicketType,
  currentStepSaveUpdate,
  addOrUpdateTicketSet, // Action to add a new ticket type
  resetTicketSets, // Action to reset ticket types
} = ticketSlice.actions;

export const selectTickets = (state) => state.tickets;

export default ticketSlice.reducer;
