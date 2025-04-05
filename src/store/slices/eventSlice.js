import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  ALL_EVENT_MOCK_API,
  ENABLE_MOCK_API,
  EVENT_DETAILS_MOCK_API,
} from "configs/MockConfig";
import EventMockData from "mock/data/eventData";
import EventService from "services/EventService";
const initialState = {
  eventDetails: {},
  eventTypeDetails: {},
  events: [],
  eventType: [],
  filteredEvents: [],
  loading: false,
  error: null,
  type_option: null,
  selectedCoupons: [],
  editItemId: null,
  selectedOffers: [],
  eventOnPlaces: [],
  organizerEvents: [],
  validationData: [],
  submitData: {},
  messages: null,
  responseImpactData: null,
  currentStep: 1,
  submitLoading: false,
  dialogVisible: false,
  validationStatus: false,
  ValidateData: null,
  eventValidationDialogVisible: false,
  modalLoading: false,
  selectedEvent: null,
  warningMessage: null,
  responseData: null,
  warningPagination: { size: 10, page: 1 },
  responseMessage: null,
  editable_status: null,
  eventsupport: null,
  pagination: { size: 10, page: 1 },
};

export const fetchEventDetails = createAsyncThunk(
  "event/fetchEventDetails",
  async (eventId, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchEventDetails;
        return response.data;
      } else {
        const response = await EventService.fetchEventDetails(eventId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchEventTypeDetails = createAsyncThunk(
  "event/fetchEventTypeDetails",
  async (typeId, { rejectWithValue }) => {
    try {
      const response = await EventService.fetchEventTypeDetails(typeId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchEventTypeOption = createAsyncThunk(
  "event/fetchEventTypeOption",
  async (_, { rejectWithValue }) => {
    try {
      const response = await EventService.fetchEventTypeOption();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchEventOnPlaces = createAsyncThunk(
  "event/fetchEventOnPlaces",
  async (placeId, { rejectWithValue }) => {
    try {
      console.log("-------------EventsOn PLaces");
      const response = await EventService.fetchEventsOnPlace(placeId);
      console.log("-------------EventsOn PLaces", response.data);

      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

export const fetchOrganizerEvents = createAsyncThunk(
  "event/fetchOrganizerEvents",
  async (userId, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchOrganizerEvents;
        return response.data;
      } else {
        const response = await EventService.fetchOrganizerEvents(userId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchEventSupportAvailable = createAsyncThunk(
  "event/fetchEventSupportAvailable",
  async (eventId, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchOrganizerEvents;
        return response.data;
      } else {
        const response = await EventService.fetchEventSupportAvailable(eventId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchAllEvent = createAsyncThunk(
  "event/fetchAllEvent",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ENABLE_MOCK_API && ALL_EVENT_MOCK_API) {
        const response = EventMockData.fetchAllEvent;
        return response.data;
      } else {
        const response = await EventService.getAllEvent(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchEventType = createAsyncThunk(
  "event/fetchEventType",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await EventService.fetchEventType(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const checkEventValidation = createAsyncThunk(
  "event/validation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await EventService.checkValidation();
      if (response.status.status_code === "00000") {
        return response.data;
      } else {
        return rejectWithValue(
          response.status.message ||
            "Event validation failed. Please try again."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to validate event. Please try again."
      );
    }
  }
);

export const addEvent = createAsyncThunk(
  "event/addEvent",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventService.addEvent(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);
export const addEventType = createAsyncThunk(
  "event/addEventType",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventService.addEventType(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);
export const editEvent = createAsyncThunk(
  "event/edit",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await EventService.updateEvent(data, action, pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const updateEventType = createAsyncThunk(
  "event/updateEventType",
  async ({ data, action,pageData }, { rejectWithValue }) => {
    try {
      const response = await EventService.updateEventType(data, action,pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editEventStatus = createAsyncThunk(
  "event/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await EventService.editEventStatus(
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
export const editEventTypeStatus = createAsyncThunk(
  "event/editEventTypeStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await EventService.editEventTypeStatus(
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

export const validateMultipleEvent = createAsyncThunk(
  "event/validateMultiple",
  async (eventIds, { rejectWithValue }) => {
    try {
      const response = await EventService.validateMultiEvent(eventIds);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,

  reducers: {
    resetState: (state) => {
      return initialState;
    },
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
    setSubmitData(state, action) {
      state.submitData = { ...state.submitData, ...action.payload };
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
    setSubmitLoading(state, action) {
      state.submitLoading = action.payload;
    },
    resetSelected: (state) => {
      state.selectedOffers = [];
      state.selectedCoupons = [];
      state.currentStep = 1;
    },
    setWarningMessage(state, action) {
      state.warningMessage = action.payload;
    },
    toggleSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.id === action.payload.id
      );
      if (existingOfferIndex !== -1) {
        state.selectedOffers.splice(existingOfferIndex, 1);
      } else {
        console.log("ADEDDDDDDDDDDDDDD");
        console.log(action.payload, "THISSSSSSSSSSSSSS");

        state.selectedOffers.push(action.payload);
      }
    },
    toggleSelectedCoupon: (state, action) => {
      const existingCouponIndex = state.selectedCoupons.findIndex(
        (coupon) => coupon.id === action.payload.id
      );
      if (existingCouponIndex !== -1) {
        state.selectedCoupons.splice(existingCouponIndex, 1);
      } else {
        state.selectedCoupons.push(action.payload);
      }
    },
    setDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedEvent(state, action) {
      state.selectedEvent = action.payload;
    },
    setEventValidationDialogVisible(state, action) {
      state.eventValidationDialogVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateMultipleEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateMultipleEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.log("HELOOOOOOOOOO");

        if (payload.message === "warning") {
          state.validationStatus = false;
          state.messages = payload.status.message;
          state.ValidateData = payload.status.data;
          console.log(payload.status.data, "DATAAAAAAA IN PAYLOAD");
          state.editable_status = payload.status.editable_status;
        } else if (payload.data) {
          state.validationStatus = payload.data[0].validation_status;
          if (payload.status) {
            state.messages = payload.status.message;
          }
        }
      })
      .addCase(validateMultipleEvent.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(addEvent.pending, (state) => {
        console.log("AddEvent - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        console.log("AddEvent - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addEvent.rejected, (state, action) => {
        console.error("AddEvent - Rejected", action.payload);
        state.loading = false;
        state.error = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addEventType.pending, (state) => {
        console.log("addEventType - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addEventType.fulfilled, (state, action) => {
        console.log("addEventType - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addEventType.rejected, (state, action) => {
        console.error("addEventType - Rejected", action.payload);
        state.loading = false;
        state.error = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(editEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(editEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.messages = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEventType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEventType.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.messages = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(updateEventType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editEventStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEventStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.messages = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editEventStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editEventTypeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEventTypeStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.messages = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editEventTypeStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
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
      .addCase(fetchEventType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventType.fulfilled, (state, action) => {
        state.loading = false;
        state.eventType = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchEventType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventTypeOption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTypeOption.fulfilled, (state, action) => {
        state.loading = false;
        state.type_option = action.payload.data;
      })

      .addCase(fetchEventTypeOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventOnPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventOnPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOnPlaces = action.payload.items;
        state.filteredEvents = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchEventOnPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkEventValidation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEventValidation.fulfilled, (state, action) => {
        state.loading = false;
        state.validationData = action.payload;
      })
      .addCase(checkEventValidation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        const eventData = { ...action.payload[0] };

        const uniqueOffers = eventData?.event_offers?.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item) => item.offer.id === current.offer.id
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        const uniqueCoupons = eventData?.event_coupons?.reduce((acc, current) => {
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
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventTypeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTypeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.eventTypeDetails = action.payload.data[0];
      })
      .addCase(fetchEventTypeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganizerEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        console.log(action.payload[0].items);
        state.loading = false;
        state.organizerEvents = action.payload[0].items;
        state.pagination = action.payload;
      })
      .addCase(fetchOrganizerEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventSupportAvailable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventSupportAvailable.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.eventsupport = action.payload[0].event_support;
      })
      .addCase(fetchEventSupportAvailable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDialogVisible,
  setModalLoading,
  setSelectedEvent,
  filterEvent,
  setSubmitData,
  toggleSelectedCoupon,
  setWarningMessage,
  resetState,
  toggleSelectedOffer,
  resetSelected,
  setCurrentStep,
  setSubmitLoading,
  setEventValidationDialogVisible,
  setEditItemId,
} = eventSlice.actions;

export default eventSlice.reducer;
