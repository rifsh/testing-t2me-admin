import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import mockData from "../../mock/auth/login.mock.json";

import { LoginForm } from "../../../src/views/auth-views/components/LoginForm"; // Import named export
import authReducer from "../../../src/store/slices/authSlice";
import locationReducer from "../../../src/store/slices/locationSlice";
import { TENANT_SCHEMA } from "../../../src/constants/AuthConstant";

// Mock the modules that import global store
jest.mock("../../../src/services/AuthService", () => ({
    __esModule: true,
    default: {},
}));

jest.mock("../../../src/auth/FetchInterceptor", () => ({
    __esModule: true,
    default: {},
}));

// Mock the getUserdata action
jest.mock("../../../src/store/slices/authSlice", () => {
    const actual = jest.requireActual("../../../src/store/slices/authSlice");
    return {
        ...actual,
        getUserdata: jest.fn(() => ({ type: "auth/getUserdata" })),
    };
});

describe("LoginForm Component", () => {
    let store;

    const mockSignIn = jest.fn();
    const mockShowLoading = jest.fn();
    const mockHideAuthMessage = jest.fn();
    const mockGoogleLogin = jest.fn();
    const mockFacebookLogin = jest.fn();

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Clear all mocks
        jest.clearAllMocks();

        store = configureStore({
            reducer: {
                auth: authReducer,
                locations: locationReducer,
            },
            preloadedState: {
                auth: {
                    loading: false,
                    message: "",
                    showMessage: false,
                    token: null,
                    redirect: "/dashboard",
                },
                locations: {
                    tenant_country: mockData.countries,
                },
            },
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    const renderWithProviders = (customStore = store) =>
        render(
            <Provider store={customStore}>
                <BrowserRouter>
                    <LoginForm
                        signIn={mockSignIn}
                        showLoading={mockShowLoading}
                        hideAuthMessage={mockHideAuthMessage}
                        signInWithGoogle={mockGoogleLogin}
                        signInWithFacebook={mockFacebookLogin}
                        token={null}
                        loading={false}
                        redirect="/dashboard"
                        showMessage={false}
                        message=""
                    />
                </BrowserRouter>
            </Provider>
        );

    it("renders login form successfully", () => {
        renderWithProviders();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText("Country")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("validates required fields", async () => {
        renderWithProviders();
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
        expect(await screen.findAllByText(/Please input/i)).toHaveLength(2);
    });

    it("submits form and dispatches signIn", async () => {
        renderWithProviders();

        // Fill in email
        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, {
            target: { value: mockData.validUser.email },
        });

        // Fill in password
        const passwordInput = screen.getByLabelText(/Password/i);
        fireEvent.change(passwordInput, {
            target: { value: mockData.validUser.password },
        });

        // Select country
        const countrySelect = screen.getByLabelText("Country");
        fireEvent.mouseDown(countrySelect);

        // Wait for dropdown options to appear
        const uaeOption = await screen.findByText(mockData.validUser.country.name);
        fireEvent.click(uaeOption);

        // Submit form
        const submitButton = screen.getByRole("button", { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowLoading).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                username: mockData.validUser.email,
                password: mockData.validUser.password,
                country_id: mockData.validUser.country.id,
            });
        });

        // Check localStorage
        expect(localStorage.getItem(TENANT_SCHEMA)).toBe(mockData.validUser.country.schema_name);
    });

    it("shows error message when showMessage=true", () => {
        const errorStore = configureStore({
            reducer: {
                auth: authReducer,
                locations: locationReducer
            },
            preloadedState: {
                auth: {
                    loading: false,
                    message: "Invalid credentials",
                    showMessage: true,
                    token: null,
                    redirect: "/dashboard",
                },
                locations: {
                    tenant_country: mockData.countries,
                },
            },
        });

        render(
            <Provider store={errorStore}>
                <BrowserRouter>
                    <LoginForm
                        signIn={mockSignIn}
                        showLoading={mockShowLoading}
                        hideAuthMessage={mockHideAuthMessage}
                        signInWithGoogle={mockGoogleLogin}
                        signInWithFacebook={mockFacebookLogin}
                        token={null}
                        loading={false}
                        redirect="/dashboard"
                        showMessage={true}
                        message="Invalid credentials"
                    />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});