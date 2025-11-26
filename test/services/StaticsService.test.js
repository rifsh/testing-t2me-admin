import StaticsService from '../../src/services/StaticsService';
import fetch from 'auth/FetchInterceptor';
import { ApiConstant } from 'constants/ApiConstant';

// Mock the fetch module
jest.mock('auth/FetchInterceptor');

describe('StaticsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchAnnualStatsforEvents', () => {
        it('should fetch annual stats for events with correct parameters', async () => {
            const mockResponse = { data: [{ statistics: [] }] };
            fetch.mockResolvedValue(mockResponse);

            const result = await StaticsService.fetchAnnualStatsforEvents();

            expect(fetch).toHaveBeenCalledWith({
                url: ApiConstant.STATICS_EVENT_LIST,
                method: 'get',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should handle errors when fetching event stats', async () => {
            const errorMessage = 'Network error';
            fetch.mockRejectedValue(new Error(errorMessage));

            await expect(StaticsService.fetchAnnualStatsforEvents()).rejects.toThrow(errorMessage);
        });
    });

    describe('fetchAnnualStatsforUsers', () => {
        it('should fetch annual stats for users with pagination parameters', async () => {
            const mockResponse = { data: [{ statistics: [] }] };
            const pageData = { page: 1, size: 10 };
            fetch.mockResolvedValue(mockResponse);

            const result = await StaticsService.fetchAnnualStatsforUsers(pageData);

            expect(fetch).toHaveBeenCalledWith({
                url: ApiConstant.STATICS_USER_LIST,
                method: 'get',
                params: pageData,
            });
            expect(result).toEqual(mockResponse);
        });

        it('should handle fetch without pagination parameters', async () => {
            const mockResponse = { data: [{ statistics: [] }] };
            fetch.mockResolvedValue(mockResponse);

            const result = await StaticsService.fetchAnnualStatsforUsers({});

            expect(fetch).toHaveBeenCalledWith({
                url: ApiConstant.STATICS_USER_LIST,
                method: 'get',
                params: {},
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('fetchAnnualStatsforSchedules', () => {
        it('should fetch annual stats for schedules with correct parameters', async () => {
            const mockResponse = { data: [{ statistics: [] }] };
            fetch.mockResolvedValue(mockResponse);

            const result = await StaticsService.fetchAnnualStatsforSchedules();

            expect(fetch).toHaveBeenCalledWith({
                url: ApiConstant.STATICS_SCHEDULES_LIST,
                method: 'get',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});