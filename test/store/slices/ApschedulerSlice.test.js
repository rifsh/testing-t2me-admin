import { configureStore } from "@reduxjs/toolkit";
import reducer, {
    fetchAllApschedulerLogs,
    fetchAllActivityLogs,
    initialState,
} from "../../../src/store/slices/apschedulerSlice";

jest.mock("services/ApschedulerService", () => ({
    getAllapschedulerLogs: jest.fn(),
    getAllActivityLogs: jest.fn(),
}));

import apschedulerService from "../../../src/services/ApschedulerService";

describe("ApschedulerSlice Tests", () => {
    let store;

    const createTestStore = () =>
        configureStore({
            reducer: {
                apscheduler: reducer,
            },
        });

    beforeEach(() => {
        jest.clearAllMocks();
        store = createTestStore();
    });

    // ------------------------------------------------------
    // TEST: Initial State
    // ------------------------------------------------------
    it("should return the correct initial state", () => {
        const state = store.getState().apscheduler;
        expect(state).toEqual(initialState);
    });

    // ------------------------------------------------------
    // TEST: fetchAllApschedulerLogs ✔ SUCCESS
    // ------------------------------------------------------
    it("should handle fetchAllApschedulerLogs fulfilled", async () => {
        const mockResponse = {
            items: [{ id: 1 }],
            data: { items: [{ log: "abc" }], page: 1, size: 10, total: 1 },
            run_time: "12:00",
            counts_by_types: { success: 10, failure: 2 },
        };

        apschedulerService.getAllapschedulerLogs.mockResolvedValue({
            data: [mockResponse],
        });

        await store.dispatch(fetchAllApschedulerLogs({ page: 1 }));

        const state = store.getState().apscheduler;

        expect(apschedulerService.getAllapschedulerLogs).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.coupons).toEqual(mockResponse.items);
        expect(state.allActivityLogs).toEqual(mockResponse.data.items);
        expect(state.pagination).toEqual(mockResponse.data);
        expect(state.runTime).toBe("12:00");
        expect(state.countsByTypes).toEqual(mockResponse.counts_by_types);
    });

    // ------------------------------------------------------
    // TEST: fetchAllApschedulerLogs ❌ REJECTED
    // ------------------------------------------------------
    it("should handle fetchAllApschedulerLogs rejected", async () => {
        apschedulerService.getAllapschedulerLogs.mockRejectedValue({
            response: { data: "Network Error" },
        });

        await store.dispatch(fetchAllApschedulerLogs({ page: 1 }));

        const state = store.getState().apscheduler;

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Network Error");
    });

    // ------------------------------------------------------
    // TEST: fetchAllActivityLogs ✔ SUCCESS
    // ------------------------------------------------------
    it("should handle fetchAllActivityLogs fulfilled", async () => {
        const mockResponse = {
            items: [{ id: 100 }],
            data: { items: [{ log: "activity-log" }], page: 2, size: 20, total: 5 },
            run_time: "15:00",
            counts_by_types: { warning: 5, info: 3 },
        };

        apschedulerService.getAllActivityLogs.mockResolvedValue({
            data: [mockResponse],
        });

        await store.dispatch(fetchAllActivityLogs({ page: 2 }));

        const state = store.getState().apscheduler;

        expect(apschedulerService.getAllActivityLogs).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.coupons).toEqual(mockResponse.items);
        expect(state.allActivityLogs).toEqual(mockResponse.data.items);
        expect(state.pagination).toEqual(mockResponse.data);
        expect(state.runTime).toBe("15:00");
        expect(state.countsByTypes).toEqual(mockResponse.counts_by_types);
    });

    // ------------------------------------------------------
    // TEST: fetchAllActivityLogs ❌ REJECTED
    // ------------------------------------------------------
    it("should handle fetchAllActivityLogs rejected", async () => {
        apschedulerService.getAllActivityLogs.mockRejectedValue({
            response: { data: "Server Down" },
        });

        await store.dispatch(fetchAllActivityLogs({ page: 1 }));

        const state = store.getState().apscheduler;

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Server Down");
    });
});
