
import faqReducer, {
  fetchAllFaqs,
  addFaq,
  deleteFaq,
  editFaq,
  createSection,
  deleteSection,
  setModalVisible,
  initialState,
} from 'store/slices/faqSlice';
import FaqService from 'services/FaqService';

// Mock services
jest.mock('services/FaqService');

describe('faqSlice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(faqReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // Test for fetchAllFaqs async thunk
  describe('fetchAllFaqs async thunk', () => {
    const faqsData = { data: [{ id: 1, question: 'Q1' }], sections: ['s1'] };

    it('should handle pending state', () => {
      const action = { type: fetchAllFaqs.pending.type };
      const nextState = faqReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const action = { type: fetchAllFaqs.fulfilled.type, payload: faqsData };
      const nextState = faqReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.faqs).toEqual(faqsData.data);
      expect(nextState.faqSections).toEqual(faqsData.sections);
    });

    it('should handle rejected state', () => {
      const error = { payload: 'Failed to fetch FAQs' };
      const action = { type: fetchAllFaqs.rejected.type, ...error };
      const nextState = faqReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch FAQs');
    });
  });

  // Test for addFaq async thunk
  describe('addFaq async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: addFaq.pending.type };
      const nextState = faqReducer(initialState, action);
      expect(nextState.submitting).toBe(true);
    });
  });

  // Test for Reducers
  describe('reducers', () => {
    it('should handle setModalVisible', () => {
      const nextState = faqReducer(initialState, setModalVisible(true));
      expect(nextState.isModalVisible).toBe(true);
    });
  });
});
