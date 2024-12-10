  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import { ENABLE_MOCK_API, GET_TICKET_MOCK_API } from "configs/MockConfig";
  import TicketMockData from "mock/data/ticketData";
  import TicketsService from "services/TicketService";

  export const initialState = {
    loading: false,
    error: null,
    searchTerm: "",
    statusFilter: "All",
    filteredTickets: [],
    placeId: null,
    venueId: null,
    // selectedVenue: null,
    isModalVisible: false,
  };

  export const fetchAllTickets = createAsyncThunk(
    "ticket/fetchAllTickets",
    async (_, { rejectWithValue, getState }) => {
      // const { placeId, venueId } = getState().tickets;

      // if (!placeId || !venueId) {
      //   return rejectWithValue("Please select a Place and Venue.");
      // }

      try {
        if (GET_TICKET_MOCK_API && ENABLE_MOCK_API) {
          const response = TicketMockData.getAllTickets;
          return response.data;
        } else {
          const response = await TicketsService.getAllTickets(1);
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
  export const ticketSlice = createSlice({
    name: "tickets",
    initialState,
    reducers: {
      setSearchTerm(state, action) {
        state.searchTerm = action.payload;
      },
      setStatusFilter(state, action) {
        state.statusFilter = action.payload;
      },
      setPlaceId(state, action) {
        state.placeId = action.payload;
      },
      setVenueId(state, action) {
        state.venueId = action.payload;
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
      // setSelectedVenue(state, action) {
      //   state.selectedVenue = action.payload;  
      // },
      setIsModalVisible(state, action) {
        state.isModalVisible = action.payload;
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
    setPlaceId,
    setVenueId,
    filterTickets,
    // setSelectedVenue,
    setIsModalVisible,
  } = ticketSlice.actions;

  export const selectTickets = (state) => state.tickets;

  export default ticketSlice.reducer;
