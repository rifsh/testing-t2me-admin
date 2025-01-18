
// import { createSlice } from '@reduxjs/toolkit';
// import OrganizerUpdateMockData from 'mock/data/orgUpdate';
// import { setLoading } from './locationSlice';

// const initialState = {
//   orgUpdates: [],
//   loading: false,
//   error: null,
//   pagination: {
//     page: 1,
//     size: 10,
//     total: 0,
//   },
// };

// const organizerUpdateSlices = createSlice({
//   name: 'organizerUpdates',
//   initialState,
//   reducers: {
//     fetchOrgUpdatesStart(state) {
//       state.loading = true;
//     },
//     fetchOrgUpdatesSuccess(state, action) {
//       state.loading = false;
//       state.orgUpdates = action.payload.items;
//       state.pagination = {
//         page: action.payload.page,
//         size: action.payload.size,
//         total: action.payload.total,
//       };
//     },
//     fetchOrgUpdatesFailure(state, action) {
//       state.loading = false;
//       state.error = action.payload;
//     },
//   },
// });

// export const {
//   fetchOrgUpdatesStart,
//   fetchOrgUpdatesSuccess,
//   fetchOrgUpdatesFailure,
// } = organizerUpdateSlices.actions;

// export const fetchOrgUpdates = (page = 1, size = 10) => async (dispatch) => {
//   try {
//     dispatch(fetchOrgUpdatesStart());

//     // Simulate fetching from mock data
//     const data = OrganizerUpdateMockData.getOrgUpdates.data[0];

//     dispatch(fetchOrgUpdatesSuccess(data));
//   } catch (error) {
//     dispatch(fetchOrgUpdatesFailure(error.message));
//   }
  
// };
// const organizerUpdateSlice = createSlice({
//   name: 'organizerUpdate',
//   initialState,
//   reducers: {
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
//     set
//   }
// })


// export default organizerUpdateSlices.reducer;
