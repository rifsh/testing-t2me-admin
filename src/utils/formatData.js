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
}
export default DataFormatUtils;
