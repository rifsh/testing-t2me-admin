import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import LoginForm from "../../../src/views/auth-views/components/LoginForm";
import auth from "../../../src/store/slices/authSlice";
import locationReducer from "../../../src/store/slices/locationSlice";
import { TENANT_SCHEMA } from "constants/AuthConstant";

describe("LoginForm Component", () => {
    let store;

    const mockSignIn = jest.fn();
    const mockShowLoading = jest.fn();
    const mockHideAuthMessage = jest.fn();
    const mockGoogleLogin = jest.fn();
    const mockFacebookLogin = jest.fn();

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: auth,
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
                    tenant_country: [
                        { id: 1, name: "UAE", schema_name: "uae_schema" },
                        { id: 2, name: "India", schema_name: "india_schema" },
                    ],
                },
            },
        });
    });

    const renderWithProviders = () =>
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <LoginForm
                        signIn={mockSignIn}
                        showLoading={mockShowLoading}
                        hideAuthMessage={mockHideAuthMessage}
                        signInWithGoogle={mockGoogleLogin}
                        signInWithFacebook={mockFacebookLogin}
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

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: "test@gmail.com" },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "123456" },
        });

        // Select country (assuming Ant Design Select)
        fireEvent.mouseDown(screen.getByText("Country"));
        await waitFor(() => fireEvent.click(screen.getByText("UAE")));

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockShowLoading).toHaveBeenCalled();
            expect(mockSignIn).toHaveBeenCalledWith({
                username: "test@gmail.com",
                password: "123456",
                country_id: 1,
            });
            expect(localStorage.getItem(TENANT_SCHEMA)).toBe("uae_schema");
        });
    });

    it("handles google login", () => {
        renderWithProviders();
        fireEvent.click(screen.getByText("Google"));
        expect(mockShowLoading).toHaveBeenCalled();
        expect(mockGoogleLogin).toHaveBeenCalled();
    });

    it("handles facebook login", () => {
        renderWithProviders();
        fireEvent.click(screen.getByText("Facebook"));
        expect(mockShowLoading).toHaveBeenCalled();
        expect(mockFacebookLogin).toHaveBeenCalled();
    });

    it("shows error message when showMessage=true", () => {
        store = configureStore({
            reducer: { auth: auth, locations: locationReducer },
            preloadedState: {
                auth: { ...store.getState().auth, showMessage: true, message: "Invalid credentials" },
                locations: store.getState().locations,
            },
        });

        renderWithProviders();
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
