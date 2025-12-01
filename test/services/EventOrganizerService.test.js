
import EventOrganizerService from 'services/EventOrganizerService';
import fetch from 'auth/FetchInterceptor';
import { ApiConstant } from 'constants/ApiConstant';
import Utils from 'utils';

// Mock the fetch interceptor
jest.mock('auth/FetchInterceptor');

// Mock the Utils module
jest.mock('utils', () => ({
  createFormData: jest.fn((data) => data),
  filterParams: jest.fn((params) => params),
}));

describe('EventOrganizerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch organizer updates', async () => {
    const pageData = { page: 1 };
    fetch.mockResolvedValue({ data: 'success' });

    await EventOrganizerService.fetchOrganizerUpdates(pageData);

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.EVENT_ORGANIZER_UPDATES,
      method: 'get',
      params: pageData,
    });
  });

  it('should fetch a single organizer update', async () => {
    const eventUpId = 123;
    fetch.mockResolvedValue({ data: 'success' });

    await EventOrganizerService.fetchSingleOrganizerUpdate(eventUpId);

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.EVENT_ORGANIZER_SINGLE_UPDATE,
      method: 'get',
      params: { eventup_id: eventUpId },
    });
  });

  // Add more tests for other service methods
});
