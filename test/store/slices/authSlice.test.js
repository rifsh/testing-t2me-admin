
import authReducer, {
  signIn,
  signOut,
  signUp,
  verifyOtp,
  ResendOtp,
  getUserdata,
  TermsCondition,
  PostTermsCondition,
  fetchSingleUsers,
  authenticated,
  showAuthMessage,
  hideAuthMessage,
  signOutSuccess,
  showLoading,
  signInSuccess,
  initialState,
  signInWithGoogle,
  signInWithFacebook,
} from 'store/slices/authSlice';
import AuthService from 'services/AuthService';
import UserService from 'services/userService';
import { AUTH_TOKEN } from 'constants/AuthConstant';

// Mock services
jest.mock('services/AuthService');
jest.mock('services/userService');
jest.mock('jwt-decode', () => jest.fn());

describe('authSlice', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // Test for signIn async thunk
  describe('signIn async thunk', () => {
    const signInData = { username: 'test', password: 'password', country_id: '1' };
    const responseData = { data: { access_token: 'fake-token', access_matrix: [] } };

    it('should handle pending state', () => {
      const action = { type: signIn.pending.type };
      const nextState = authReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled state', async () => {
        const action = { type: signIn.fulfilled.type, payload: responseData };
        const nextState = authReducer(initialState, action);
  
        expect(nextState.token).toBe('fake-token');
        expect(nextState.loading).toBe(false);
      });

    it('should handle rejected state', async () => {
      const error = { payload: 'Login failed' };
      const action = { type: signIn.rejected.type, ...error };
      const nextState = authReducer(initialState, action);

      expect(nextState.message).toBe('Login failed');
      expect(nextState.showMessage).toBe(true);
      expect(nextState.loading).toBe(false);
    });
  });

  // Test for signOut async thunk
  describe('signOut async thunk', () => {
    it('should handle fulfilled state', async () => {
        const action = { type: signOut.fulfilled.type };
        const nextState = authReducer({ ...initialState, token: 'fake-token' }, action);
  
        expect(nextState.token).toBeNull();
        expect(nextState.loading).toBe(false);
      });
  });

  // Test for signUp async thunk
  describe('signUp async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: signUp.pending.type };
      const nextState = authReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });
  });

  // ... other thunks ...

  // Test for Reducers
  describe('reducers', () => {
    it('should handle authenticated', () => {
      const nextState = authReducer(initialState, authenticated('new-token'));
      expect(nextState.token).toBe('new-token');
      expect(nextState.loading).toBe(false);
    });

    it('should handle showAuthMessage', () => {
      const nextState = authReducer(initialState, showAuthMessage('Test message'));
      expect(nextState.message).toBe('Test message');
      expect(nextState.showMessage).toBe(true);
    });

    it('should handle hideAuthMessage', () => {
      const state = { ...initialState, showMessage: true, message: 'Test' };
      const nextState = authReducer(state, hideAuthMessage());
      expect(nextState.showMessage).toBe(false);
      expect(nextState.message).toBe('');
    });

    it('should handle signOutSuccess', () => {
      const state = { ...initialState, token: 'test-token' };
      const nextState = authReducer(state, signOutSuccess());
      expect(nextState.token).toBeNull();
    });

    it('should handle showLoading', () => {
      const nextState = authReducer(initialState, showLoading());
      expect(nextState.loading).toBe(true);
    });

    it('should handle signInSuccess', () => {
      const nextState = authReducer(initialState, signInSuccess('new-token'));
      expect(nextState.token).toBe('new-token');
      expect(nextState.loading).toBe(false);
    });
  });
});
