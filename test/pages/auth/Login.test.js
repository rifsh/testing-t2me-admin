import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Login from "../../../src/views/auth-views/authentication/login/index";
import Utils from "utils";

// Mock LoginForm component
jest.mock("../../../src/views/auth-views/components/LoginForm", () => () => (
    <div data-testid="login-form">Mock Login Form</div>
));

jest.mock("../../../src/auth/FetchInterceptor.js", () => ({
    __esModule: true,
    default: {},
}));

jest.mock("../../../src/services/ScheduleService.js", () => ({
    __esModule: true,
    default: {},
}));


// Mock Utils.clearAllBrowserData
jest.spyOn(Utils, "clearAllBrowserData").mockImplementation(jest.fn());

const mockStore = configureStore([]);

const renderWithStore = (initialState = {
    theme: { currentTheme: "light" },
    schedules: { data: [], loading: false }, // 👈 add schedules slice
}) => {
    const store = mockStore(initialState);
    return render(
        <Provider store={store}>
            <Login />
        </Provider>
    );
};

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should call Utils.clearAllBrowserData on mount", () => {
        renderWithStore();
        expect(Utils.clearAllBrowserData).toHaveBeenCalledTimes(1);
    });

    test("should render the LoginForm component", () => {
        renderWithStore();
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    test("should display light theme logo when theme = 'light'", () => {
        renderWithStore({ theme: { currentTheme: "light" }, schedules: { data: [], loading: false } });

        const logo = screen.getByRole("img");
        expect(logo).toHaveAttribute("src", "/img/logo.png");
    });

    test("should display dark theme logo when theme = 'dark'", () => {
        renderWithStore({ theme: { currentTheme: "dark" }, schedules: { data: [], loading: false } });

        const logo = screen.getByRole("img");
        expect(logo).toHaveAttribute("src", "/img/logo-white.png");
    });

    test("renders component UI layout without crashing", () => {
        renderWithStore({ theme: { currentTheme: "light" }, schedules: { data: [], loading: false } });

        // Check card content container
        expect(screen.getByRole("img")).toBeInTheDocument();
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });
});
