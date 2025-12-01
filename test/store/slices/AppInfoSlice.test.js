
import appInfoReducer, {
  fetchAppInfo,
  uploadImageToCdn,
  updateInfo,
  setModalVisible,
  initialState,
} from 'store/slices/AppInfoSlice';
import AppInfoService from 'services/AppInfoService';

// Mock services
jest.mock('services/AppInfoService');

describe('AppInfoSlice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(appInfoReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // Test for fetchAppInfo async thunk
  describe('fetchAppInfo async thunk', () => {
    const appInfoData = { details: { under_maintenance: true } };

    it('should handle pending state', () => {
      const action = { type: fetchAppInfo.pending.type };
      const nextState = appInfoReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const action = { type: fetchAppInfo.fulfilled.type, payload: appInfoData };
      const nextState = appInfoReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.appInfo).toEqual(appInfoData);
      expect(nextState.maintenanceData).toBe(true);
    });

    it('should handle rejected state', () => {
      const error = { payload: 'Failed to fetch app info' };
      const action = { type: fetchAppInfo.rejected.type, ...error };
      const nextState = appInfoReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch app info');
    });
  });

  // Test for uploadImageToCdn async thunk
  describe('uploadImageToCdn async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: uploadImageToCdn.pending.type };
      const nextState = appInfoReducer(initialState, action);
      expect(nextState.uploadingImages).toBe(true);
    });
  });

  // Test for updateInfo async thunk
  describe('updateInfo async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: updateInfo.pending.type };
      const nextState = appInfoReducer(initialState, action);
      expect(nextState.loading).toBe(true);
    });
  });

  // Test for Reducers
  describe('reducers', () => {
    it('should handle setModalVisible', () => {
      const nextState = appInfoReducer(initialState, setModalVisible(true));
      expect(nextState.isModalVisible).toBe(true);
    });
  });
});
