import { configureStore } from "@reduxjs/toolkit";
import reducer, {
    initialState,
    fetchCategories,
    fetchSubcategories,
    addCategory,
    validateCategory,
    updateCategory,
    filterCategory,
    setActiveTab,
    clearSubcategories,
} from "../../../src/store/slices/CategorySlice";
import mockResponseData from '../../mock/slices/category.mock.json'
jest.mock("services/CategoryService", () => ({
    fetchCategory: jest.fn(),
    fetchSubCategory: jest.fn(),
    addCategory: jest.fn(),
    validateCategory: jest.fn(),
    updateCategory: jest.fn(),
}));

import CategoryService from "../../../src/services/CategoryService";

describe("CategorySlice (Mock Mode OFF)", () => {
    let store;

    const createTestStore = () =>
        configureStore({
            reducer: {
                category: reducer,
            },
        });

    beforeEach(() => {
        jest.clearAllMocks();
        store = createTestStore();
    });

    // ---------------------------------------
    // Initial state
    // ---------------------------------------
    it("should return initial state", () => {
        const state = store.getState().category;
        expect(state).toEqual(initialState);
    });

    // ---------------------------------------
    // fetchCategories SUCCESS
    // ---------------------------------------
    it("should handle fetchCategories fulfilled", async () => {
        const mockResponse = mockResponseData?.fetched_payload;
        CategoryService.fetchCategory.mockResolvedValue({ data: [mockResponse] });

        await store.dispatch(fetchCategories({ page: 1 }));

        const state = store.getState().category;
        expect(CategoryService.fetchCategory).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.categories).toEqual(mockResponseData?.fetched_payload.items);
        expect(state.filteredCategories).toEqual(mockResponseData?.fetched_payload.items);
        expect(state.pagination).toEqual(mockResponseData.fetched_payload);
    });

    // ---------------------------------------
    // fetchCategories REJECTED
    // ---------------------------------------
    it("should handle fetchCategories rejected", async () => {
        CategoryService.fetchCategory.mockRejectedValue(new Error("API Error"));

        await store.dispatch(fetchCategories({ page: 1 }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to fetch categories");
    });

    // ---------------------------------------
    // fetchSubcategories SUCCESS
    // ---------------------------------------
    it("should handle fetchSubcategories fulfilled", async () => {
        const mockResponse = { items: [{ id: 101, name: "Subcategory 1" }] };
        CategoryService.fetchSubCategory.mockResolvedValue({ data: [mockResponse] });

        await store.dispatch(fetchSubcategories({ category_id: 1, page: 1 }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.subcategories).toEqual(mockResponse.items);
        expect(state.filteredSubCategories).toEqual(mockResponse.items);
        expect(state.subPagination).toEqual(mockResponse);
    });

    // ---------------------------------------
    // fetchSubcategories REJECTED
    // ---------------------------------------
    it("should handle fetchSubcategories rejected", async () => {
        CategoryService.fetchSubCategory.mockRejectedValue(new Error("API Fail"));

        await store.dispatch(fetchSubcategories({ category_id: 1, page: 1 }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to fetch subcategories");
    });

    // ---------------------------------------
    // addCategory SUCCESS
    // ---------------------------------------
    it("should handle addCategory fulfilled", async () => {
        const mockResponse = {
            data: [{ id: 1, name: "New Cat" }],
            status: { message: "Category added" },
        };
        CategoryService.addCategory.mockResolvedValue(mockResponse);

        await store.dispatch(addCategory({ data: {}, action: "add" }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.responseData).toEqual(mockResponse.data);
        expect(state.responseMessage).toBe("Category added");
    });

    // ---------------------------------------
    // addCategory REJECTED
    // ---------------------------------------
    it("should handle addCategory rejected", async () => {
        CategoryService.addCategory.mockRejectedValue({
            response: { data: { message: "Failed to add" } },
        });

        await store.dispatch(addCategory({ data: {}, action: "add" }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to add");
    });

    // ---------------------------------------
    // validateCategory SUCCESS
    // ---------------------------------------
    it("should handle validateCategory fulfilled with warning", async () => {
        const mockPayload = {
            message: "warning",
            status: { message: "Warning Message", data: [1], editable_status: true },
        };
        CategoryService.validateCategory.mockResolvedValue(mockPayload);

        await store.dispatch(validateCategory(1));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.validationStatus).toBe(false);
        expect(state.message).toBe("Warning Message");
        expect(state.ValidateData).toEqual([1]);
        expect(state.editable_status).toBe(true);
    });

    // ---------------------------------------
    // updateCategory SUCCESS
    // ---------------------------------------
    it("should handle updateCategory fulfilled", async () => {
        const mockPayload = mockResponseData.edit_payload;
        CategoryService.updateCategory.mockResolvedValue(mockPayload);

        await store.dispatch(updateCategory({ data: mockPayload, action: "warning" }));

        const state = store.getState().category;
        expect(state.loading).toBe(false);
        expect(state.message).toBe(null);
        expect(state.editable_status).toBe(null);
    });

    // ---------------------------------------
    // Reducer actions
    // ---------------------------------------
    it("should handle filterCategory action", () => {
        store.dispatch(
            filterCategory({ searchTerm: "cat", type: "category" })
        );
        const state = store.getState().category;
        expect(state.filteredCategories).toEqual(
            state.categories.filter((c) => c.name.toLowerCase().includes("cat"))
        );
    });

    it("should handle setActiveTab action", () => {
        store.dispatch(setActiveTab("subcategories"));
        const state = store.getState().category;
        expect(state.activeTab).toBe("subcategories");
        store.dispatch(setActiveTab("categories"));
        expect(store.getState().category.selectedCategoryId).toBe(null);
    });

    it("should handle clearSubcategories action", () => {
        store.dispatch(clearSubcategories());
        const state = store.getState().category;
        expect(state.subcategories).toEqual([]);
        expect(state.selectedCategoryId).toBe(null);
    });
});
