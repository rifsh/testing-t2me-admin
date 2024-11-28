import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CategoryService from "services/CategoryService";

export const initialState = {
  loading: false,
  categories: [],
  error: null,
}; 

export const addCategory = createAsyncThunk(
  "category/add",
  async (data, { rejectWithValue }) => {
    const { title, descr } = data
    try {
      const response = await CategoryService.addCategory(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add category");
    }
  }
);

export const fetchCategory = createAsyncThunk(
  "category/list",
  async (_, { rejectWithValue }) => {
    try {
      console.log("API triggered");
      const response = await CategoryService.fetchCategory();

      // Log response to make sure it has the correct structure
      console.log("API Response:", response);

      // Assuming the response data is an array (based on your log)
      if (Array.isArray(response)) {
        return response; // This should be returned directly
      } else {
        console.error("Invalid response structure:", response);
        return rejectWithValue("Invalid response data");
      }
    } catch (err) {
      console.log("API Failed", err);
      return rejectWithValue(err.response?.data || "Failed to fetch categories");
    }
  }
);



const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories.push(payload);
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;  // Reset error on a new request
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        console.log("Fetched Categories Full Action:", action);  // Log the entire action object
        console.log("Fetched Categories Payload1:", action.payload);  
        if (Array.isArray(action.payload)) {
          console.log("Fetched Categories Payload2:", action.payload); 
          state.categories = action.payload;  // Update state if it's an array
        } else {
          console.error("Invalid payload in fulfilled action", action.payload);
        }      
        state.loading = false;
        state.categories = action.payload;  // Update the categories array with the fetched data
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });

  },
});

export default categorySlice.reducer;

