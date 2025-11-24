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
import jwtDecode from "jwt-decode";

jest.mock("services/AuthService");
jest.mock("services/userService");
jest.mock("jwt-decode");

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
        AuthService.login.mockResolvedValue({ data: { access_token: "token123", access_matrix: ["read"] } });
        const { state, action } = await testAsyncThunk(store, signIn, { username: "test", password: "123", country_id: 1 });

        expect(state.token).toBe("token123");
        expect(state.allowedAccess).toEqual(["read"]);
        expect(state.redirect).toBe("/");
        expect(action.type).toBe("auth/login/fulfilled");
        expect(localStorage.getItem("AUTH_TOKEN")).toBe("token123");
    });

    it("signIn failure", async () => {
        AuthService.login.mockRejectedValue({ data: { status: { message: "Invalid" } } });
        const { state, action } = await testAsyncThunk(store, signIn, { username: "test", password: "wrong", country_id: 1 });

        expect(state.showMessage).toBe(true);
        expect(state.message).toBe("Invalid");
        expect(action.type).toBe("auth/login/rejected");
    });

    // signOut
    it("signOut success", async () => {
        AuthService.logout.mockResolvedValue({ data: "success" });
        localStorage.setItem("AUTH_TOKEN", "token123");
        const { state } = await testAsyncThunk(store, signOut);

        expect(state.token).toBeNull();
        expect(state.redirect).toBe("/");
        expect(localStorage.getItem("AUTH_TOKEN")).toBeNull();
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
        const { state } = await testAsyncThunk(store, signUp, { username: "test" });

        expect(state.responseData).toEqual({ id: 1 });
        expect(state.responseMessage).toBe("Registered");
        expect(state.error).toBeNull();
    });

    it("signUp failure", async () => {
        AuthService.register.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, signUp, { username: "test" });

        expect(state.error).toBe("Error");
    });

    // verifyOtp
    it("verifyOtp success", async () => {
        AuthService.verifyOtp.mockResolvedValue({ data: { verified: true }, status: { message: "OTP verified" } });
        const { state } = await testAsyncThunk(store, verifyOtp, { otp: "1234" });

        expect(state.responseData).toEqual({ verified: true });
        expect(state.responseMessage).toBe("OTP verified");
        expect(state.error).toBeNull();
    });

    it("verifyOtp failure", async () => {
        AuthService.verifyOtp.mockRejectedValue({ response: { data: { message: "OTP fail" } } });
        const { state } = await testAsyncThunk(store, verifyOtp, { otp: "0000" });

        expect(state.error).toBe("OTP fail");
    });

    // ResendOtp
    it("ResendOtp success", async () => {
        AuthService.ResendOtp.mockResolvedValue({ data: { otp: "1234" }, status: { message: "OTP sent" } });
        const { state } = await testAsyncThunk(store, ResendOtp, { phone: "1234567890" });

        expect(state.responseData).toEqual({ otp: "1234" });
        expect(state.responseMessage).toBe("OTP sent");
    });

    it("ResendOtp failure", async () => {
        AuthService.ResendOtp.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, ResendOtp, { phone: "123" });

        expect(state.error).toBe("Error");
    });

    // signInWithGoogle
    it("signInWithGoogle success", async () => {
        AuthService.loginInOAuth.mockResolvedValue({ data: { token: "google-token" } });
        const { state } = await testAsyncThunk(store, signInWithGoogle);

        expect(state.token).toBe("google-token");
        expect(state.redirect).toBe("/");
    });

    it("signInWithGoogle failure", async () => {
        AuthService.loginInOAuth.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, signInWithGoogle);

        expect(state.showMessage).toBe(true);
        expect(state.message).toBe("Error");
    });

    // signInWithFacebook
    it("signInWithFacebook success", async () => {
        AuthService.loginInOAuth.mockResolvedValue({ data: { token: "fb-token" } });
        const { state } = await testAsyncThunk(store, signInWithFacebook);

        expect(state.token).toBe("fb-token");
        expect(state.redirect).toBe("/");
    });

    it("signInWithFacebook failure", async () => {
        AuthService.loginInOAuth.mockRejectedValue({ response: { data: { message: "Error" } } });
        const { state } = await testAsyncThunk(store, signInWithFacebook);

        expect(state.showMessage).toBe(true);
        expect(state.message).toBe("Error");
    });

    // getUserdata
    it("getUserdata success", async () => {
        localStorage.setItem("AUTH_TOKEN", "token123");
        jwtDecode.mockReturnValue({ id: 1, name: "User" });

        const { state } = await testAsyncThunk(store, getUserdata);
        expect(state.userData).toEqual({ id: 1, name: "User" });
    });

    it("getUserdata failure", async () => {
        jwtDecode.mockImplementation(() => { throw new Error("Decode Error"); });
        const { state } = await testAsyncThunk(store, getUserdata);
        expect(state.showMessage).toBe(true);
    });

    // TermsCondition
    it("TermsCondition success", async () => {
        AuthService.TermsCondition.mockResolvedValue({ terms: "Some terms" });
        const { state } = await testAsyncThunk(store, TermsCondition);
        expect(state.termsConditionData).toEqual({ terms: "Some terms" });
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