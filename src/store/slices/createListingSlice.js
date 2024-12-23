// src/store/slices/commonSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const createListingSlice = ({ name, fetchThunk, initialState = {} }) => {
  return createSlice({
    name,
    initialState: {
      items: [],
      filteredItems: [],
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      ...initialState
    },
    reducers: {
      setCurrentPage: (state, action) => {
        state.currentPage = action.payload;
      },
      setPageSize: (state, action) => {
        state.pageSize = action.payload;
      },
      filterItems: (state, action) => {
        const { searchTerm, status } = action.payload;
        let filtered = [...state.items];
        
        if (status && status !== "All") {
          filtered = filtered.filter(item => 
            (status === "Active" && item.status === true) ||
            (status === "Inactive" && item.status === false)
          );
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filtered = filtered.filter(item => {
            return (
              item.event_name?.toLowerCase().includes(searchLower) ||
              item.category?.name?.toLowerCase().includes(searchLower) ||
              item.sub_category?.name?.toLowerCase().includes(searchLower) ||
              item.venue?.name?.toLowerCase().includes(searchLower) ||
              String(item.max_tickets)?.includes(searchLower)
            );
          });
        }

        state.filteredItems = filtered;
        state.currentPage = 1;
      },
      resetState: () => initialState,
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchThunk.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.items;
          state.filteredItems = action.payload.items;
          state.total = action.payload.pagination.total;
          state.currentPage = action.payload.pagination.currentPage;
          state.pageSize = action.payload.pagination.pageSize;
          state.totalPages = action.payload.pagination.totalPages;
        })
        .addCase(fetchThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
};