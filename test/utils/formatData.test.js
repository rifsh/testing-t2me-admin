import DataFormatUtils from '../../src/utils/formatData';
import mockData from '../mock/utils/formatData.mock.json';

describe('DataFormatUtils', () => {
  it('should format userDetails correctly', () => {
    const formattedData = DataFormatUtils.userDetails(mockData.userDetails);
    expect(formattedData).toEqual({
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '1234567890',
      role: 'admin',
      position_id: 1,
      country: 'USA',
      avatar: 'avatar.jpg',
      status: true,
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',
      access_matrix: ['read', 'write'],
      events: ['event1', 'event2'],
      theatres: ['theater1', 'theater2'],
    });
  });

  it('should format theaterListItem correctly', () => {
    const formattedData = DataFormatUtils.theaterListItem(mockData.theaterListItem);
    expect(formattedData).toEqual({
      id: 1,
      name: 'Test Theater',
      address: 'Main Venue',
      city: 'Test City',
      country: 'Test Country',
      phone: '9876543210',
      email: 'theater@example.com',
      status: 'active',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',
    });
  });

  it('should format eventItem correctly', () => {
    const formattedData = DataFormatUtils.eventItem(mockData.eventItem);
    expect(formattedData).toEqual({
      id: 1,
      value: 1, 
      name: 'Test Event',
      description: 'This is a test event.',
      thumbnail: 'event.jpg',
      status: 'active',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',

      category_id: 1,
      category_name: 'Test Category',
      sub_category_id: 1,
      sub_category_name: 'Test Sub-category',
      event_type_id: 1,
      event_type_name: 'Test Event Type',
      event_type_display_name: 'Test Event Type',
      event_type_redirect_url: '/test-event',
      event_type_code: 'TEST',
      event_type_status: 'active',
      event_type_description: 'This is a test event type.',
      venues: [
        {
          id: 1,
          name: 'Test Venue',
          description: 'This is a test venue.',
          place_name: 'Test Place',
        },
      ],

      updates: ['update1', 'update2'],
    });
  });
});
