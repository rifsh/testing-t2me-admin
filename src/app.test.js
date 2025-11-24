import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as UserAccessConfig from "./configs/UserAccessConfig";

// Mock modules
jest.mock("./layouts", () => () => <div data-testid="layouts">Layouts Component</div>);
jest.mock("./configs/UserAccessConfig", () => ({
    getCurrentUser: jest.fn(),
}));
jest.mock("./mock"); // mockServer will be automatically mocked
jest.mock("./store", () => ({
    getState: () => ({}),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}));

// Mock window caches and serviceWorker
beforeAll(() => {
    Object.defineProperty(window, "caches", {
        value: { keys: jest.fn().mockResolvedValue([]), delete: jest.fn().mockResolvedValue(true) },
        writable: true,
    });

    Object.defineProperty(navigator, "serviceWorker", {
        value: { getRegistrations: jest.fn().mockResolvedValue([]) },
        writable: true,
    });

    sessionStorage.clear = jest.fn();
});

describe("App component", () => {
    it("renders without crashing and calls getCurrentUser", async () => {
        UserAccessConfig.getCurrentUser.mockReturnValue({ id: 1, name: "Test User" });

        render(<App />);

        await waitFor(() => {
            // Layouts component should render
            expect(screen.getByTestId("layouts")).toBeInTheDocument();
        });

        // getCurrentUser should be called once
        expect(UserAccessConfig.getCurrentUser).toHaveBeenCalled();
    });

    it("clears caches and service workers on mount", async () => {
        const cachesDeleteSpy = jest.spyOn(window.caches, "delete");
        const swUnregisterSpy = jest.spyOn(navigator.serviceWorker, "getRegistrations");

        render(<App />);

        await waitFor(() => {
            expect(cachesDeleteSpy).not.toHaveBeenCalled(); // because no caches exist
            expect(swUnregisterSpy).toHaveBeenCalled();
            jest.spyOn(sessionStorage.__proto__, 'clear').mockImplementation(() => { });
        });
    });

    it("logs environment on mount", () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        render(<App />);

        expect(consoleSpy).toHaveBeenCalledWith("env", process.env.NODE_ENV);

        consoleSpy.mockRestore();
    });
});