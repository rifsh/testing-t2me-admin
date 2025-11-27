import { configureStore } from "@reduxjs/toolkit";
import reducer, {
    fetchAppInfo,
    uploadImageToCdn,
    updateInfo,
    setModalVisible,
} from "../../../src/store/slices/AppInfoSlice";

jest.mock("services/AppInfoService", () => ({
    getInfo: jest.fn(),
    uploadImageToCdn: jest.fn(),
    updateInfo: jest.fn(),
}));

import AppInfoService from "../../../src/services/AppInfoService";
import mockResponse from "../../mock/slices/appInfo.mock.json";

describe("AppInfoSlice Tests", () => {
    let store;

    const createTestStore = () =>
        configureStore({
            reducer: {
                appinfo: reducer,
            },
        });

    beforeEach(() => {
        jest.clearAllMocks();
        store = createTestStore();
    });

    // ------------------------------------------------------
    // TEST: Initial State
    // ------------------------------------------------------
    it("should have the correct initial state", () => {
        const state = store.getState().appinfo;

        expect(state).toEqual({
            loading: false,
            submitting: false,
            uploadingImages: false,
            adCategories: [],
            filteredAdCategories: [],
            responseData: null,
            appInfo: null,
            appInfoData: {},
            maintenanceData: null,
            error: null,
            message: null,
            pagination: {},
            editable_status: null,
            isModalVisible: false,
        });
    });

    // ------------------------------------------------------
    // TEST: fetchAppInfo Success
    // ------------------------------------------------------
    it("should handle fetchAppInfo fulfilled", async () => {
        // const mockResponse = {
        //     details: { under_maintenance: true },
        //     name: "Sample Info",
        // };

        AppInfoService.getInfo.mockResolvedValue(mockResponse);

        await store.dispatch(fetchAppInfo());

        const state = store.getState().appinfo;

        expect(AppInfoService.getInfo).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.appInfo).toEqual(mockResponse);
        expect(state.appInfoData).toEqual(mockResponse);
        expect(state.maintenanceData).toBe(mockResponse.details.under_maintenance);
    });

    // ------------------------------------------------------
    // TEST: fetchAppInfo Rejected
    // ------------------------------------------------------
    it("should handle fetchAppInfo rejected", async () => {
        AppInfoService.getInfo.mockRejectedValue(new Error("Server Down"));

        await store.dispatch(fetchAppInfo());

        const state = store.getState().appinfo;

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to fetch FAQs");
    });

    // ------------------------------------------------------
    // TEST: uploadImageToCdn Success
    // ------------------------------------------------------
    it("should handle uploadImageToCdn fulfilled", async () => {
        const mockResponse = { url: "cdn/image.png" };

        AppInfoService.uploadImageToCdn.mockResolvedValue(mockResponse);

        await store.dispatch(uploadImageToCdn({ file: "dummy", moduleName: "test" }));

        const state = store.getState().appinfo;

        expect(AppInfoService.uploadImageToCdn).toHaveBeenCalledTimes(1);
        expect(state.uploadingImages).toBe(false);
        expect(state.error).toBe(null);
    });

    // ------------------------------------------------------
    // TEST: uploadImageToCdn Rejected
    // ------------------------------------------------------
    it("should handle uploadImageToCdn rejected", async () => {
        AppInfoService.uploadImageToCdn.mockRejectedValue(new Error("Upload failed"));

        await store.dispatch(uploadImageToCdn({ file: "dummy", moduleName: "test" }));

        const state = store.getState().appinfo;

        expect(state.uploadingImages).toBe(false);
        expect(state.error).toBe("Upload failed");
    });

    // ------------------------------------------------------
    // TEST: updateInfo Success
    // ------------------------------------------------------
    it("should handle updateInfo fulfilled", async () => {
        const mockResponse = {
            status: { message: "Updated Successfully" },
        };

        AppInfoService.updateInfo.mockResolvedValue(mockResponse);

        await store.dispatch(updateInfo({ key: "value" }));

        const state = store.getState().appinfo;

        expect(AppInfoService.updateInfo).toHaveBeenCalledTimes(1);
        expect(state.loading).toBe(false);
        expect(state.message).toBe("Updated Successfully");
    });

    // ------------------------------------------------------
    // TEST: updateInfo Rejected
    // ------------------------------------------------------
    it("should handle updateInfo rejected", async () => {
        AppInfoService.updateInfo.mockRejectedValue(new Error("Bad Request"));

        await store.dispatch(updateInfo({ key: "value" }));

        const state = store.getState().appinfo;

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Bad Request");
    });

    // ------------------------------------------------------
    // TEST: Reducer Action – setModalVisible
    // ------------------------------------------------------
    it("should update isModalVisible when setModalVisible is called", () => {
        store.dispatch(setModalVisible(true));
        expect(store.getState().appinfo.isModalVisible).toBe(true);

        store.dispatch(setModalVisible(false));
        expect(store.getState().appinfo.isModalVisible).toBe(false);
    });
});
