class DataFormatUtils {
  static userDetails = (data) => {
    return {
      id: data.user?.id,
      username: data.user?.username,
      email: data.user?.email,
      phone: data.user?.phone_number,
      role: data.user?.role?.name,
      position_id: data.user?.role?.position_id,
      country: data.user?.country_name,
      avatar: data.user?.thumbnail_image,
      status: data.user?.is_active,
      created_at: data.user?.created_at,
      updated_at: data.user?.updated_at,
      access_matrix: data.user?.access_matrix || [],
      events: data.events || [],
      theatres: data.theatres || [],
    };
  };

  static theaterListItem = (theater) => {
    return {
      id: theater.id,
      name: theater.name,
      address: theater.venue?.name || null,
      city: theater.place?.name || null,
      country: theater.place?.country?.name || null,
      phone: theater.phone_number,
      email: theater.company?.email || null,
      status: theater.status,
      created_at: theater.place?.created_at || null,
      updated_at: theater.place?.updated_at || null,
    };
  };
  static eventItem = (event) => {
    return {
      id: event.id,
      value: event.id, // Required for Select component
      name: event.event_name,
      description: event.description,
      thumbnail: event.thumbnail_image,
      status: event.status,
      created_at: event.created_at,
      updated_at: event.updated_at,

      category_id: event.category?.id,
      category_name: event.category?.name,
      sub_category_id: event.sub_category?.id,
      sub_category_name: event.sub_category?.name,
      event_type_id: event.event_type?.id,
      event_type_name: event.event_type?.name,
      event_type_display_name: event.event_type?.display_name,
      event_type_redirect_url: event.event_type?.redirect_url,
      event_type_code: event.event_type?.event_code,
      event_type_status: event.event_type?.status,
      event_type_description: event.event_type?.description,
      venues: (event.venues || []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        description: venue.description,
        place_name: venue.place?.name || null,
      })),

      updates: event.updates || [],
    };
  };
}
export default DataFormatUtils;
