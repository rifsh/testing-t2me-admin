import { configureStore } from '@reduxjs/toolkit';
import staticsReducer, {
    fetchAnnualStatsforEvents,
    fetchUserStatsForUsers,
    fetchUserStatsForSchedules,
    setAnnualStats,
    setUserStats,
    setMessage,
} from '../../../src/store/slices/staticsSlice';
import StaticsService from '../../../src/services/StaticsService';
import StaticsMockData from '../../mock/app-views/statistics/staticsDashboard.constants.json';
import StaticsSliceMockData from '../../mock/slices/statisticsSlice.mock';

jest.mock('configs/MockConfig', () => ({
    ENABLE_MOCK_API: true,
    ENABLE_STATICS_MOCK_API: true,
}));
jest.mock('services/StaticsService');
jest.mock('mock/data/staticsData');
jest.mock('configs/MockConfig', () => ({
    ENABLE_MOCK_API: false,
    ENABLE_STATICS_MOCK_API: false,
}));

describe('staticsSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                statics: staticsReducer,
            },
        });
    });

    describe('initial state', () => {
        it('should return the initial state', () => {
            const state = store.getState().statics;
            expect(state).toEqual({
                annualStatsForEvents: [],
                annualStatsForUsers: [],
                annualStatsForSchedules: [],
                loading: false,
                loadingMembers: true,
                loadingSchedules: false,
                error: null,
                message: null,
                pagination: { size: 10, page: 1 },
            });
        });
    });

    describe('reducers', () => {
        it('should handle setAnnualStats', () => {
            const mockStats = [{ statistics: ['event1', 'event2'] }];

            store.dispatch(setAnnualStats(mockStats));

            const state = store.getState().statics;
            expect(state.annualStatsForEvents).toEqual(mockStats[0].statistics);
        });

        it('should handle setUserStats', () => {
            const mockStats = [{ statistics: ['user1', 'user2'] }];

            store.dispatch(setUserStats(mockStats));

            const state = store.getState().statics;
            expect(state.annualStatsForUsers).toEqual(mockStats[0].statistics);
        });

        it('should handle setMessage', () => {
            const message = 'Test message';

            store.dispatch(setMessage(message));

            const state = store.getState().statics;
            expect(state.message).toBe(message);
        });
    });

    describe('async thunks', () => {
        describe('fetchAnnualStatsforEvents', () => {
            it('should handle successful fetch', async () => {
                const mockResponse = {
                    data: [
                        {
                            statistics: [
                                { month: 'January', count: 10 },
                                { month: 'February', count: 15 },
                            ],
                        },
                    ],
                };

                StaticsService.fetchAnnualStatsforEvents.mockResolvedValue(mockResponse);

                await store.dispatch(fetchAnnualStatsforEvents());

                const state = store.getState().statics;
                expect(state.loading).toBe(false);
                expect(state.annualStatsForEvents).toEqual(mockResponse.data[0].statistics);
                expect(state.error).toBeNull();
            });

            it('should handle fetch failure', async () => {
                const errorMessage = 'Network error';
                StaticsService.fetchAnnualStatsforEvents.mockRejectedValue(new Error(errorMessage));

                await store.dispatch(fetchAnnualStatsforEvents());

                const state = store.getState().statics;
                expect(state.loading).toBe(false);
                expect(state.error).toBe(errorMessage);
            });

            it('should use mock data when mock API is enabled', async () => {
                jest.resetModules(); // IMPORTANT!!! Clears previous imports

                // Mock config BEFORE re-importing slice
                jest.doMock('configs/MockConfig', () => ({
                    ENABLE_MOCK_API: true,
                    ENABLE_STATICS_MOCK_API: true,
                }));

                jest.doMock('mock/data/staticsData', () => ({
                    fetchAnnualStatsForEvents: {
                        data: [
                            {
                                statistics: [
                                    { month: 'January', count: 5 },
                                    { month: 'February', count: 8 },
                                ],
                            },
                        ],
                    },
                }));

                // Re-import slice AFTER mocks
                const staticsModule = await import('../../../src/store/slices/staticsSlice');
                const reducer = staticsModule.default;
                const thunk = staticsModule.fetchAnnualStatsforEvents;

                const store = configureStore({
                    reducer: { statics: reducer },
                });

                await store.dispatch(thunk());

                const state = store.getState().statics;

                expect(state.annualStatsForEvents).toEqual([
                    { month: 'January', count: 5 },
                    { month: 'February', count: 8 },
                ]);
            });

        });
        describe('fetchUserStatsForSchedules', () => {
            it('should handle successful fetch', async () => {
                const mockResponse = {
                    data: [
                        {
                            statistics: [
                                { schedule: 'schedule1', status: 'completed' },
                                { schedule: 'schedule2', status: 'pending' },
                            ],
                        },
                    ],
                };

                StaticsService.fetchAnnualStatsforSchedules.mockResolvedValue(mockResponse);

                await store.dispatch(fetchUserStatsForSchedules());

                const state = store.getState().statics;
                expect(state.loadingSchedules).toBe(false);
                expect(state.annualStatsForSchedules).toEqual(mockResponse.data[0].statistics);
                expect(state.error).toBeNull();
            });

            it('should handle fetch failure', async () => {
                const errorMessage = 'Failed to fetch schedule stats';
                StaticsService.fetchAnnualStatsforSchedules.mockRejectedValue(new Error(errorMessage));

                await store.dispatch(fetchUserStatsForSchedules());

                const state = store.getState().statics;
                expect(state.loadingSchedules).toBe(false);
                expect(state.error).toBe(errorMessage);
            });
        });
    });

    describe('loading states', () => {
        it('should set loading state for events fetch', async () => {
            StaticsService.fetchAnnualStatsforEvents.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            const promise = store.dispatch(fetchAnnualStatsforEvents());

            let state = store.getState().statics;
            expect(state.loading).toBe(true);

            await promise;

            state = store.getState().statics;
            expect(state.loading).toBe(false);
        });

        it('should set loadingMembers state for users fetch', async () => {
            StaticsService.fetchAnnualStatsforUsers.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            const promise = store.dispatch(fetchUserStatsForUsers({}));

            let state = store.getState().statics;
            expect(state.loadingMembers).toBe(true);

            await promise;

            state = store.getState().statics;
            expect(state.loadingMembers).toBe(false);
        });

        it('should set loadingSchedules state for schedules fetch', async () => {
            StaticsService.fetchAnnualStatsforSchedules.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            const promise = store.dispatch(fetchUserStatsForSchedules());

            let state = store.getState().statics;
            expect(state.loadingSchedules).toBe(true);

            await promise;

            state = store.getState().statics;
            expect(state.loadingSchedules).toBe(false);
        });
    });
});