import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TheaterCompanyService from "services/TheaterCompanyService";
import TheaterService from "services/theaterService";

const initialState = {
    activeTab: "Companies",
    loading: false,
    editLoading: false,
    isDetailModal: false,
    response: null,
    statusEditresponse: null,
    editId: null,
    editData: [],
    singleResponse: null,
    submitMessage: null,
    formType: null,
    editable_status: null,
    message: null,
    pagination: { size: 10, page: 1 },
    error: null,
};

export const createTheaterCompany = createAsyncThunk(
    "cast/createTheaterCompany",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await TheaterCompanyService.createTheaterCompany(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating Company");
        }
    }
);
export const fetchTheaterCompanies = createAsyncThunk(
    "cast/fetchTheaterCompanies",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await TheaterCompanyService.getTheaterCompanies(pageData);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch companies");
        }
    }
);
export const fetchTheaterCompanyByid = createAsyncThunk(
    "cast/fetchTheaterCompanyByid",
    async (company_id, { rejectWithValue }) => {
        try {
            const response = await TheaterCompanyService.getTheaterCompanyById(company_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const editTheaterCompany = createAsyncThunk(
    "cast/editTheaterCompany",
    async ({ data, action, pageData }, { rejectWithValue }) => {
        try {
            const response = await TheaterCompanyService.editTheaterCompany(data, action, pageData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);
export const editTheaterCompanyStatus = createAsyncThunk(
    "cast/editTheaterCompanyStatus",
    async ({ data, action, pageData }, { rejectWithValue }) => {
        try {
            const response = await TheaterCompanyService.editCompanyTheaterStatus(data, action, pageData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);

const theaterCompanySlice = createSlice({
    name: "theaterCompany",
    initialState,
    reducers: {
        setTheaterCompanyEditData(state, action) {
            state.editData = action.payload;
        },
        setTheaterEditId(state, action) {
            state.editId = action.payload;
        },
        setCleraAllData(state) {
            state.response = null;
            state.singleResponse = null;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setTheaterCompanyEditId(state, action) {
            state.editId = action.payload;
        },
        setDetailModal: (state, action) => {
            state.isDetailModal = action.payload;
            if (!action.payload) {
                state.singleResponse = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTheaterCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(createTheaterCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload.data;
                state.submitMessage = action.payload.status.message;
            })
            .addCase(createTheaterCompany.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchTheaterCompanies.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTheaterCompanies.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchTheaterCompanies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTheaterCompanyByid.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTheaterCompanyByid.fulfilled, (state, action) => {
                state.loading = false;
                state.singleResponse = action.payload;
            })
            .addCase(fetchTheaterCompanyByid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editTheaterCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(editTheaterCompany.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.response = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                }
            })
            .addCase(editTheaterCompany.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editTheaterCompanyStatus.pending, (state) => {
                state.editLoading = true;
            })
            .addCase(editTheaterCompanyStatus.fulfilled, (state, { payload }) => {
                state.editLoading = false;
                state.statusEditresponse = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editTheaterCompanyStatus.rejected, (state, action) => {
                state.editLoading = false;
                state.error = action.payload;
            })
    },
});

export const { setTheaterCompanyEditData, setTheaterEditId, setCleraAllData, setActiveTab, setDetailModal, setTheaterCompanyEditId } = theaterCompanySlice.actions;

export default theaterCompanySlice.reducer;
