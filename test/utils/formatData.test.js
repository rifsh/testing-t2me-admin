
import DataFormatUtils from 'utils/formatData';
import mockData from 'test/mock/utils/formatData.mock.json';

describe('DataFormatUtils', () => {
  it('should format user details correctly', () => {
    const { input, output } = mockData.userDetails;
    const formattedData = DataFormatUtils.userDetails(input);
    expect(formattedData).toEqual(output);
  });

  it('should format theater list item correctly', () => {
    const { input, output } = mockData.theaterListItem;
    const formattedData = DataFormatUtils.theaterListItem(input);
    expect(formattedData).toEqual(output);
  });

  it('should format event item correctly', () => {
    const { input, output } = mockData.eventItem;
    const formattedData = DataFormatUtils.eventItem(input);
    expect(formattedData).toEqual(output);
  });

  it('should handle missing user data gracefully', () => {
    const formattedData = DataFormatUtils.userDetails({});
    expect(formattedData).toEqual({
      id: undefined,
      username: undefined,
      email: undefined,
      phone: undefined,
      role: undefined,
      position_id: undefined,
      country: undefined,
      avatar: undefined,
      status: undefined,
      created_at: undefined,
      updated_at: undefined,
      access_matrix: [],
      events: [],
      theatres: [],
    });
  });

  it('should handle missing theater data gracefully', () => {
    const formattedData = DataFormatUtils.theaterListItem({});
    expect(formattedData).toEqual({
        id: undefined,
        name: undefined,
        address: null,
        city: null,
        country: null,
        phone: undefined,
        email: null,
        status: undefined,
        created_at: null,
        updated_at: null,
    });
  });

  it('should handle missing event data gracefully', () => {
    const formattedData = DataFormatUtils.eventItem({});
    expect(formattedData).toEqual({
      id: undefined,
      value: undefined,
      name: undefined,
      description: undefined,
      thumbnail: undefined,
      status: undefined,
      created_at: undefined,
      updated_at: undefined,
      category_id: undefined,
      category_name: undefined,
      sub_category_id: undefined,
      sub_category_name: undefined,
      event_type_id: undefined,
      event_type_name: undefined,
      event_type_display_name: undefined,
      event_type_redirect_url: undefined,
      event_type_code: undefined,
      event_type_status: undefined,
      event_type_description: undefined,
      venues: [],
      updates: [],
    });
  });
});
