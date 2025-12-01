
import eventOrganizerReducer, {
  fetchOrganizerUpdates,
  fetchSingleOrganizerUpdate,
  toggleComments,
  setComment,
  initialState,
} from 'store/slices/EventOrganizerSlice';
import EventOrganizerService from 'services/EventOrganizerService';

// Mock services
jest.mock('services/EventOrganizerService');

describe('EventOrganizerSlice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(eventOrganizerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // Test for fetchOrganizerUpdates async thunk
  describe('fetchOrganizerUpdates async thunk', () => {
    const updatesData = { items: [{ id: 1, name: 'Update 1' }], pagination: {} };

    it('should handle pending state', () => {
      const action = { type: fetchOrganizerUpdates.pending.type };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const action = { type: fetchOrganizerUpdates.fulfilled.type, payload: updatesData };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.organizerUpdates).toEqual(updatesData.items);
    });

    it('should handle rejected state', () => {
      const error = { payload: 'Failed to fetch updates' };
      const action = { type: fetchOrganizerUpdates.rejected.type, ...error };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch updates');
    });
  });

  // Test for fetchSingleOrganizerUpdate async thunk
  describe('fetchSingleOrganizerUpdate async thunk', () => {
    const singleUpdateData = { id: 1, name: 'Single Update' };

    it('should handle pending state', () => {
      const action = { type: fetchSingleOrganizerUpdate.pending.type };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const action = { type: fetchSingleOrganizerUpdate.fulfilled.type, payload: singleUpdateData };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.singleOrganizerUpdate).toEqual(singleUpdateData);
    });

    it('should handle rejected state', () => {
      const error = { payload: 'Failed to fetch single update' };
      const action = { type: fetchSingleOrganizerUpdate.rejected.type, ...error };
      const nextState = eventOrganizerReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch single update');
    });
  });

  // Test for Reducers
  describe('reducers', () => {
    it('should handle toggleComments', () => {
      const nextState = eventOrganizerReducer(initialState, toggleComments());
      expect(nextState.showAllComments).toBe(true);
    });

    it('should handle setComment', () => {
      const nextState = eventOrganizerReducer(initialState, setComment('My comment'));
      expect(nextState.comment).toBe('My comment');
    });
  });
});
