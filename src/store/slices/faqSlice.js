import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import FaqService from "services/FaqService";

const initialState = {
  loading: false,
  submitting: false,
  adCategories: [],
  filteredAdCategories: [],
  responseData: null,
  faqs: [],
  faqSections: [],
  faqJson: null,
  error: null,
  message: null,
  pagination: {},
  editable_status: null,
  singleCategory: null,
};

export const fetchAllFaqs = createAsyncThunk(
  "faqs/fetchAllFaqs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await FaqService.getFaqs();
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch FAQs");
    }
  }
);

export const addFaq = createAsyncThunk(
  "faqs/addFaq",
  async ({ category, questions }, { getState, rejectWithValue }) => {
    try {
      const { faqJson } = getState().faqs;
      if (!faqJson) return rejectWithValue("FAQ data not initialized");

      const updatedJson = updateFaqJson(faqJson, category, questions);

      await FaqService.uploadFaqToR2(updatedJson);

      return updatedJson;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add FAQ");
    }
  }
);

const updateFaqJson = (faqJson, category, newQuestions) => {
  const updatedJson = {
    sections: [...faqJson.sections],
    data: JSON.parse(JSON.stringify(faqJson.data)),
  };

  const normalizedCategory = category.toLowerCase().trim();

  if (!updatedJson.sections.includes(normalizedCategory)) {
    updatedJson.sections = [...updatedJson.sections, normalizedCategory];
  }

  const formattedQuestions = newQuestions.map((q) => ({
    question: q.question,
    answer: q.reply,
  }));

  // Find existing section index
  const existingSectionIndex = updatedJson.data.findIndex(
    (section) => section.id === normalizedCategory
  );

  if (existingSectionIndex !== -1) {
    // Create new section object with updated FAQ array
    const existingSection = updatedJson.data[existingSectionIndex];
    const updatedSection = {
      ...existingSection,
      faq: [...existingSection.faq, ...formattedQuestions],
    };

    // Create new data array with updated section
    updatedJson.data = [
      ...updatedJson.data.slice(0, existingSectionIndex),
      updatedSection,
      ...updatedJson.data.slice(existingSectionIndex + 1),
    ];
  } else {
    // Add new section
    updatedJson.data = [
      ...updatedJson.data,
      {
        id: normalizedCategory,
        section: category,
        faq: [...formattedQuestions],
      },
    ];
  }

  console.log(updatedJson, "UPDATED JSON");

  return updatedJson;
};

const FaqSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFaqs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.faqs = payload.data;
        state.faqJson = payload;
        state.faqSections = payload.sections;
      })
      .addCase(fetchAllFaqs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addFaq.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addFaq.fulfilled, (state, { payload }) => {
        state.submitting = false;
        state.faqs = payload.data;
        state.faqJson = payload;
        state.faqSections = payload.sections;
      })
      .addCase(addFaq.rejected, (state, { payload }) => {
        state.submitting = false;
        state.error = payload;
      });
  },
});

export default FaqSlice.reducer;
