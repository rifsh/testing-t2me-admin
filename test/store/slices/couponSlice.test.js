import { configureStore } from "@reduxjs/toolkit";
import couponReducer, {
    fetchAllCoupons,
    fetchAllTrackCoupons,
    fetchCouponDetails,
    addCoupon,
    editCoupon,
    editCouponStatus,
    generateCouponCodes,
    filterCoupons,
    setEditItemId,
    setSelectedCoupon,
    setIsDateRequired,
    resetGeneratedCouponCode,
    setGeneratedCouponCode,
    setCouponDialogVisible,
    setCouponModalLoading
} from "../../../src/store/slices/couponSlice";

import mockData from "../../mock/slices/couponMockResponse.json";

// Mock AntD components safely
jest.mock("antd", () => ({
    message: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },

    Typography: {
        Text: () => null,
        Title: () => null
    },

    Select: {
        Option: () => null
    },

    Collapse: {
        Panel: () => null
    },

    Modal: () => null,
    Button: () => null,
    Slider: () => null,
    Divider: () => null
}));

// Mock CouponService with FIXED responses
jest.mock("services/CouponService", () => ({
    getAllCoupon: jest.fn(() =>
        Promise.resolve({
            data: mockData.fetchAllCouponsResponse.data  // IMPORTANT
        })
    ),

    getCouponDetails: jest.fn(() =>
        Promise.resolve(mockData.fetchCouponDetailsResponse)
    ),

    createCoupon: jest.fn(() =>
        Promise.resolve(mockData.addCouponResponse)
    ),

    editCoupon: jest.fn(() =>
        Promise.resolve(mockData.editCouponResponse)
    ),

    updateCouponStatus: jest.fn(() =>
        Promise.resolve(mockData.editStatusResponse)
    ),

    generateCodes: jest.fn(() =>
        Promise.resolve(mockData.generateCodesResponse)
    ),

    fetchTrackCoupons: jest.fn(() =>
        Promise.resolve(mockData.trackCouponsResponse)
    )
}));

describe("Coupon Slice Test Suite", () => {
    let store;

    beforeEach(() => {
        store = configureStore({ reducer: { coupon: couponReducer } });
    });

    // ------------------------------
    // Reducers
    // ------------------------------

    it("should return initial state", () => {
        const state = store.getState().coupon;

        expect(state.loading).toBe(false);
        expect(state.coupons).toEqual([]);
        expect(state.filteredCoupons).toEqual([]);
    });

    it("should set edit item id", () => {
        store.dispatch(setEditItemId(5));
        expect(store.getState().coupon.editItemId).toBe(5);
    });

    it("should set selected coupon", () => {
        store.dispatch(setSelectedCoupon({ id: 1 }));
        expect(store.getState().coupon.selectedCoupon).toEqual({ id: 1 });
    });

    it("should reset generated coupon codes", () => {
        store.dispatch(setGeneratedCouponCode(["X"]));
        store.dispatch(resetGeneratedCouponCode());
        expect(store.getState().coupon.generatedCouponCodes).toEqual([]);
    });

    // ------------------------------
    //  Async Thunks
    // ------------------------------

    it("should fetch all coupons", async () => {
        await store.dispatch(fetchAllCoupons({ page: 1 }));

        const state = store.getState().coupon;

        expect(state.coupons.length).toBe(2);
        expect(state.pagination.total).toBe(2);
    });

    it("should fetch coupon details", async () => {
        await store.dispatch(fetchCouponDetails(1));

        const state = store.getState().coupon;

        expect(state.couponDetails.id).toBe(1);
        expect(state.selectedCouponsDays.length).toBe(2);
    });

    it("should add coupons successfully", async () => {
        await store.dispatch(addCoupon({ data: {}, action: "create" }));

        const state = store.getState().coupon;

        expect(state.responseData.id).toBe(10);
        expect(state.responseMessage).toBe("Created");
    });

    it("should edit coupon successfully", async () => {
        await store.dispatch(editCoupon({ data: {}, action: "edit", pageData: {} }));

        const state = store.getState().coupon;

        expect(state.message).toBe("Updated");
        expect(state.warningPagination.size).toBe(20);
        expect(state.editable_status).toBe(true);
    });

    it("should update coupon status successfully", async () => {
        await store.dispatch(editCouponStatus({ data: {}, action: "edit", pageData: {} }));

        const state = store.getState().coupon;

        expect(state.message).toBe("Updated");
        expect(state.editable_status).toBe(true);
    });

    it("should generate coupon codes", async () => {
        await store.dispatch(generateCouponCodes({ data: {} }));

        const state = store.getState().coupon;

        expect(state.generatedCouponCodes.length).toBe(2);
    });

    it("should handle fetchAllCoupons rejected", async () => {
        const error = "Fetch error";

        const service = require("services/CouponService");

        service.getAllCoupon.mockRejectedValueOnce({
            response: { data: error }
        });

        await store.dispatch(fetchAllCoupons({}));

        expect(store.getState().coupon.error).toBe(error);
    });
});
