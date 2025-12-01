
import StaticsService from "services/StaticsService";
import fetch from "auth/FetchInterceptor";
import mockData from "test/mock/services/StaticsService.mock.json";

jest.mock("auth/FetchInterceptor");

describe("StaticsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch annual stats for events", async () => {
    const { response } = mockData.fetchAnnualStatsforEvents;
    fetch.mockResolvedValue(response);

    const result = await StaticsService.fetchAnnualStatsforEvents();

    expect(fetch).toHaveBeenCalledWith({
      url: "/statics/events",
      method: "get",
    });
    expect(result).toEqual(response);
  });

  it("should fetch annual stats for users", async () => {
    const { pageData, response } = mockData.fetchAnnualStatsforUsers;
    fetch.mockResolvedValue(response);

    const result = await StaticsService.fetchAnnualStatsforUsers(pageData);

    expect(fetch).toHaveBeenCalledWith({
      url: "/statics/users",
      method: "get",
      params: pageData,
    });
    expect(result).toEqual(response);
  });

  it("should fetch annual stats for schedules", async () => {
    const { response } = mockData.fetchAnnualStatsforSchedules;
    fetch.mockResolvedValue(response);

    const result = await StaticsService.fetchAnnualStatsforSchedules();

    expect(fetch).toHaveBeenCalledWith({
      url: "/statics/schedules",
      method: "get",
    });
    expect(result).toEqual(response);
  });
});
