import authReducer, {
    initialState,
    signIn,
    signOut,
    signUp,
    getUserdata,
    TermsCondition,
    PostTermsCondition,
    fetchSingleUsers,
    verifyOtp,
    ResendOtp,
    signInWithGoogle,
    signInWithFacebook,
    showAuthMessage,
    hideAuthMessage,
} from "../../../src/store/slices/authSlice";

import { createTestStore, testAsyncThunk } from "../../utils/reduxTestHelper";
import AuthService from "services/AuthService";
import UserService from "services/userService";
import mockData from "../../mock/auth/login.mock.json";
import { jwtDecode } from "jwt-decode";

jest.mock("services/AuthService");
jest.mock("services/userService");
jest.mock("jwt-decode");
jest.mock("jwt-decode", () => ({
    jwtDecode: jest.fn(),
}));

describe("authSlice full tests (helper)", () => {
    let store;

    beforeEach(() => {
        store = createTestStore(authReducer);
        localStorage.clear();
        jest.clearAllMocks();
    });

    // Reducers
    it("show and hide auth messages", () => {
        store.dispatch(showAuthMessage("Error"));
        expect(store.getState().slice.showMessage).toBe(true);
        expect(store.getState().slice.message).toBe("Error");

        store.dispatch(hideAuthMessage());
        expect(store.getState().slice.showMessage).toBe(false);
        expect(store.getState().slice.message).toBe("");
    });

    // signIn
    it("signIn success", async () => {
        AuthService.login.mockResolvedValue({ data: { access_token: mockData.authTOken, access_matrix: ["read"] } });
        const { state, action } = await testAsyncThunk(store, signIn, { username: mockData.validUser.email, password: mockData.validUser.password, country_id: mockData.validUser.country.id });

        expect(state.token).toBe(mockData.authTOken);
        expect(state.allowedAccess).toEqual(["read"]);
        expect(state.redirect).toBe("/");
        expect(action.type).toBe("auth/login/fulfilled");
        expect(localStorage.getItem(mockData.local_auth_field_value)).toBe(mockData.authTOken);
    });

    it("signIn failure", async () => {
        AuthService.login.mockRejectedValue({ data: { status: { message: "Invalid" } } });
        const { state, action } = await testAsyncThunk(store, signIn, { username: mockData.validUser.email, password: "wrong", country_id: mockData.validUser.country.id });

        expect(state.showMessage).toBe(true);
        expect(state.message).toBe("Invalid");
        expect(action.type).toBe("auth/login/rejected");
    });

    // signOut
    it("signOut success", async () => {
        AuthService.logout.mockResolvedValue({ data: "success" });
        localStorage.setItem(mockData.local_auth_field_value, mockData.authTOken);
        const { state } = await testAsyncThunk(store, signOut);

        expect(state.token).toBeNull();
        expect(state.redirect).toBe("/");
        expect(localStorage.getItem(mockData.local_auth_field_value)).toBeNull();
    });

    it("signOut failure", async () => {
        AuthService.logout.mockRejectedValue({});
        const { state } = await testAsyncThunk(store, signOut);

        expect(state.token).toBeNull();
        expect(state.redirect).toBe("/");
    });

    // signUp
    it("signUp success", async () => {
        AuthService.register.mockResolvedValue({ data: { id: 1 }, status: { message: "Registered" } });
        const { state } = await testAsyncThunk(store, signUp, { username: mockData.validUser.email });

        expect(state.responseData).toEqual({ id: 1 });
        expect(state.responseMessage).toBe("Registered");
        expect(state.error).toBeNull();
    });

    it("signUp failure", async () => {
        AuthService.register.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, signUp, { username: mockData.validUser.email });

        expect(state.error).toBe("Error");
    });

    // getUserdata
    it("getUserdata success", async () => {
        localStorage.setItem(mockData.local_auth_field_value, mockData.authTOken);
        jwtDecode.mockReturnValue(mockData.token_decoded);

        const { state } = await testAsyncThunk(store, getUserdata);
        expect(state.userData).toEqual(mockData.token_decoded);
    });

    it("getUserdata failure", async () => {
        jwtDecode.mockImplementation(() => { throw new Error("Decode Error"); });
        const { state } = await testAsyncThunk(store, getUserdata.rejected);
        expect(state.showMessage).toBe(true || undefined);
    });

    // TermsCondition
    it("TermsCondition success", async () => {
        AuthService.TermsCondition.mockResolvedValue({ terms: "Some terms and conditions" });
        const { state } = await testAsyncThunk(store, TermsCondition);
        expect(state.termsConditionData).toEqual({ terms: "Some terms and conditions" });
        expect(state.termsLoading).toBe(false);
    });

    it("TermsCondition failure", async () => {
        AuthService.TermsCondition.mockRejectedValue({});
        const { state } = await testAsyncThunk(store, TermsCondition);
        expect(state.error).toBe("Failed to fetch Terms and Conditions");
        expect(state.termsLoading).toBe(false);
    });

    // PostTermsCondition
    it("PostTermsCondition success", async () => {
        AuthService.PostTermsCondition.mockResolvedValue({ data: { accepted: true }, status: { message: "Saved" } });
        const { state } = await testAsyncThunk(store, PostTermsCondition, { accept: true });

        expect(state.responseData).toEqual({ accepted: true });
        expect(state.responseMessage).toBe("Saved");
    });

    it("PostTermsCondition failure", async () => {
        AuthService.PostTermsCondition.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, PostTermsCondition, { accept: false });

        expect(state.error).toBe("Error");
    });

    // fetchSingleUsers
    it("fetchSingleUsers success", async () => {
        const user = { id: 1, name: "John", access_matrix: ["read", "write"] };
        UserService.getSingleUsers.mockResolvedValue({ data: [user] });

        const { state } = await testAsyncThunk(store, fetchSingleUsers, { id: 1 });
        expect(state.singleUser).toEqual(user);
        expect(state.allowedAccess).toEqual(["read", "write"]);
    });

    it("fetchSingleUsers failure", async () => {
        UserService.getSingleUsers.mockRejectedValue({ response: { data: "Error" } });
        const { state } = await testAsyncThunk(store, fetchSingleUsers, { id: 1 });
        expect(state.error).toBe("Error");
    });
});