
import AdCategoryService from "services/AdCategoryService";
import fetch from "auth/FetchInterceptor";
import mockData from "test/mock/services/AdCategoryService.mock.json";

jest.mock("auth/FetchInterceptor");

describe("AdCategoryService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch ad categories", async () => {
    const { pageData, response } = mockData.fetchAdCategory;
    fetch.mockResolvedValue(response);

    const result = await AdCategoryService.fetchAdCategory(pageData);

    expect(fetch).toHaveBeenCalledWith({
      url: "/advertisement/category",
      method: "get",
      params: pageData,
    });
    expect(result).toEqual(response);
  });

  it("should update an ad category", async () => {
    const { data, action, pageData, response } = mockData.updateAdCategory;
    fetch.mockResolvedValue(response);

    const result = await AdCategoryService.updateAdCategory(data, action, pageData);

    expect(fetch).toHaveBeenCalledWith({
      url: "/advertisement/category/update",
      method: "put",
      data: data,
      params: {
        ...pageData,
        ad_category_id: data.id,
        action: encodeURIComponent(action),
      },
    });
    expect(result).toEqual(response);
  });

  it("should update an ad category status", async () => {
    const { data, action, pageData, response } = mockData.updateAdStatus;
    fetch.mockResolvedValue(response);

    const result = await AdCategoryService.updateAdStatus(data, action, pageData);

    expect(fetch).toHaveBeenCalledWith({
        url: "/advertisement/category/status-update",
        method: "put",
        data: data,
        params: {
          ...pageData,
          ad_category_id: data.id,
          action: encodeURIComponent(action),
        },
      });
    expect(result).toEqual(response);
  });

  it("should add an ad category", async () => {
    const { data, action, response } = mockData.addAdCategory;
    fetch.mockResolvedValue(response);

    const result = await AdCategoryService.addAdCategory(data, action);

    expect(fetch).toHaveBeenCalledWith(expect.objectContaining({
        url: "/advertisement/category",
        method: "POST",
        params: { action: encodeURIComponent(action) },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }));
    expect(result).toEqual(response);
  });

  it("should validate an ad category", async () => {
    const { adCategoryId, response } = mockData.validateAdCategory;
    fetch.mockResolvedValue(response);

    const result = await AdCategoryService.validateAdCategory(adCategoryId);

    expect(fetch).toHaveBeenCalledWith({
      url: "/advertisement/category/validate",
      method: "get",
      params: { ad_category_id: adCategoryId },
    });
    expect(result).toEqual(response);
  });
});
