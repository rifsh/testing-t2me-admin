const LocationMockData = {};
LocationMockData.fetchAllCountries = {
  data: [
    {
      id: 1,
      country: "United States",
      code: "US",
      timezone: "UTC-5 to UTC-10",
    },
    { id: 2, country: "United Kingdom", code: "GB", timezone: "UTC+0" },
    { id: 3, country: "Canada", code: "CA", timezone: "UTC-3.5 to UTC-8" },
    { id: 4, country: "China", code: "CN", timezone: "UTC+8" },
    { id: 5, country: "India", code: "IN", timezone: "UTC+5:30" },
    { id: 6, country: "Australia", code: "AU", timezone: "UTC+8 to UTC+11" },
    { id: 7, country: "Germany", code: "DE", timezone: "UTC+1" },
    { id: 8, country: "France", code: "FR", timezone: "UTC+1" },
    { id: 9, country: "Japan", code: "JP", timezone: "UTC+9" },
    { id: 10, country: "Russia", code: "RU", timezone: "UTC+2 to UTC+12" },
    { id: 11, country: "Brazil", code: "BR", timezone: "UTC-2 to UTC-5" },
    { id: 12, country: "South Africa", code: "ZA", timezone: "UTC+2" },
    { id: 13, country: "Italy", code: "IT", timezone: "UTC+1" },
    { id: 14, country: "Spain", code: "ES", timezone: "UTC+1" },
    { id: 15, country: "Mexico", code: "MX", timezone: "UTC-5 to UTC-8" },
    { id: 16, country: "South Korea", code: "KR", timezone: "UTC+9" },
    { id: 17, country: "Saudi Arabia", code: "SA", timezone: "UTC+3" },
    { id: 18, country: "Turkey", code: "TR", timezone: "UTC+3" },
    { id: 19, country: "Argentina", code: "AR", timezone: "UTC-3" },
    { id: 20, country: "Indonesia", code: "ID", timezone: "UTC+7 to UTC+9" },
    { id: 21, country: "United Arab Emirates", code: "AE", timezone: "UTC+4" },
  ],
  status: {
    message: "success",
    status_code: 200,
  },
};
export default LocationMockData;
