class DataFormatUtils {
  static userDetails = (user) => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone_number,
      role: user.role?.name,
      country: user.country_name,
      avatar: user.thumbnail_image,
      status: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      access_matrix: user.access_matrix || [],
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
