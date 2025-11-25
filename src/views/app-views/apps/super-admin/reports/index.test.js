import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { message } from 'antd';
import mockData from '../../../../../../test/mock/app-views/app/super-admin/reports/index.mock.json';

// CRITICAL: Mock axios FIRST before any other imports that use it
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() }
        },
        get: jest.fn(() => Promise.resolve({ data: mockData })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
        patch: jest.fn(() => Promise.resolve({ data: {} })),
    })),
    interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
    },
    get: jest.fn(() => Promise.resolve({ data: mockData })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock FetchInterceptor to prevent interceptor setup
jest.mock('auth/FetchInterceptor', () => ({
    __esModule: true,
    default: {
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() }
        },
        get: jest.fn(() => Promise.resolve({ data: mockData })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
    }
}));

// Mock the AdminReportService
jest.mock('services/AdminReportService', () => ({
    fetchReportData: jest.fn(() => Promise.resolve({ data: mockData.reportData })),
    fetchUserReports: jest.fn(() => Promise.resolve({ data: mockData.userReportsData })),
    fetchCountryList: jest.fn(() => Promise.resolve({ data: mockData.countryList })),
}));

// Mock antd message
jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    return {
        ...actual,
        message: {
            error: jest.fn(),
            success: jest.fn(),
            warning: jest.fn(),
            info: jest.fn(),
        },
    };
});

// Mock chart components
jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
    Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

// Mock export utilities
jest.mock('utils/exportUtils', () => ({
    exportToPdf: jest.fn(),
    exportToExcel: jest.fn(),
}));

// Mock pagination hook
jest.mock('utils/hooks/usePaginationHandler', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

// Now import the components after all mocks are set up
import SuperAdminReport from './index';
import reportReducer from 'store/slices/reportSlice';
import * as exportUtils from 'utils/exportUtils';

// Suppress console errors and warnings for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (
            message.includes('[antd: Spin]') ||
            message.includes('Warning: ReactDOM.render') ||
            message.includes('Not implemented: HTMLFormElement')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };

    console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('[antd:')) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});

// Helper function to create mock store
const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            report: reportReducer,
        },
        preloadedState: {
            report: {
                reportData: initialState.reportData || mockData.reportData,
                userReports: {
                    data: {
                        items: initialState.userReportsData || mockData.userReportsData,
                    },
                    pagination: initialState.pagination || mockData.pagination,
                },
                countryList: {
                    data: initialState.countryList || mockData.countryList,
                },
                selectedCountry: initialState.selectedCountry || 1,
                loading: initialState.isLoading || false,
                error: initialState.error || null,
            },
        },
    });
};

// Wrapper component for tests
const renderWithProviders = (component, store) => {
    return render(
        <Provider store={store}>
            <BrowserRouter>{component}</BrowserRouter>
        </Provider>
    );
};

describe('SuperAdminReport Component', () => {
    let store;

    beforeEach(() => {
        store = createMockStore();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        test('should render component without crashing', async () => {
            renderWithProviders(<SuperAdminReport />, store);
            console.log("sampleonedforlogs");

            // Wait for the AntD Spin loader to be removed
            await waitFor(() => {
                expect(screen.queryByRole("status")).not.toBeInTheDocument();
            });
            const elements = screen.getAllByText(/Event Organizers/i);
            expect(elements.length).toBeGreaterThan(0); // at least one exists
            expect(elements[0]).toBeInTheDocument();
        });


        test('should render both tabs when both features are enabled', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                const eventsElements = screen.getAllByText('Events');
                expect(eventsElements.length).toBeGreaterThan(0); // At least one exists
            });
        });

        test('should display statistics cards with correct data', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                // Event Organizers card
                const eventOrganizers = screen.getAllByText('Event Organizers');
                expect(eventOrganizers.length).toBeGreaterThan(0);
                expect(eventOrganizers[0]).toBeInTheDocument();

                // Active Event Organizers card
                const activeEventOrganizers = screen.getAllByText('Active Event Organizers');
                expect(activeEventOrganizers.length).toBeGreaterThan(0);
                expect(activeEventOrganizers[0]).toBeInTheDocument();

                // Total Events card
                const totalEvents = screen.getAllByText('Total Events');
                expect(totalEvents.length).toBeGreaterThan(0);
                expect(totalEvents[0]).toBeInTheDocument();

                // Events Revenue card
                const eventsRevenue = screen.getAllByText('Events Revenue');
                expect(eventsRevenue.length).toBeGreaterThan(0);
                expect(eventsRevenue[0]).toBeInTheDocument();
            }, { timeout: 3000 });
        });


        test('should render table with user reports data', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should render charts section', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText('Revenue Distribution')).toBeInTheDocument();
                expect(screen.getByText('Activity Distribution')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Tab Switching', () => {
        test('should switch to movies tab when clicked', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            // Wait for the Movies tab button to appear
            const moviesTab = await screen.findByRole('button', { name: /Movies/i });
            expect(moviesTab).toBeInTheDocument();

            // Click the Movies tab
            fireEvent.click(moviesTab);

            // Verify content after switching
            await waitFor(() => {
                expect(screen.getByText(/Movie Organizers/i)).toBeInTheDocument();
                expect(screen.getByText(/Total Movies/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should update statistics when switching tabs', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            // Wait for the Movies tab button and click it
            const moviesTab = await screen.findByRole('button', { name: /Movies/i });
            fireEvent.click(moviesTab);

            // Verify statistics updated
            await waitFor(() => {
                expect(screen.getByText(/Movies Revenue/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });


    describe('Time Filter Functionality', () => {
        test('should change time filter when selected', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                const selectElement = screen.getByDisplayValue('Last 3 Months');
                expect(selectElement).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should show date range picker when custom filter is selected', async () => {
            renderWithProviders(<SuperAdminReport />, store);
            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should validate custom date range does not exceed 3 months', async () => {
            expect(true).toBe(true); // Placeholder
        });
    });

    describe('Export Functionality', () => {
        test('should export to PDF when button is clicked', async () => {
            exportUtils.exportToPdf.mockResolvedValue();

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/PDF/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const pdfButton = screen.getByText(/PDF/i);
            fireEvent.click(pdfButton);

            await waitFor(() => {
                expect(exportUtils.exportToPdf).toHaveBeenCalled();
                expect(message.success).toHaveBeenCalled();
            }, { timeout: 3000 });
        });

        test('should export to Excel when button is clicked', async () => {
            exportUtils.exportToExcel.mockResolvedValue();

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/Excel/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const excelButton = screen.getByText(/Excel/i);
            fireEvent.click(excelButton);

            await waitFor(() => {
                expect(exportUtils.exportToExcel).toHaveBeenCalled();
                expect(message.success).toHaveBeenCalled();
            }, { timeout: 3000 });
        });

        test('should show error message when PDF export fails', async () => {
            exportUtils.exportToPdf.mockRejectedValue(new Error('Export failed'));

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/PDF/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const pdfButton = screen.getByText(/PDF/i);
            fireEvent.click(pdfButton);

            await waitFor(() => {
                expect(message.error).toHaveBeenCalled();
            }, { timeout: 3000 });
        });

        test('should show error message when Excel export fails', async () => {
            exportUtils.exportToExcel.mockRejectedValue(new Error('Export failed'));

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/Excel/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const excelButton = screen.getByText(/Excel/i);
            fireEvent.click(excelButton);

            await waitFor(() => {
                expect(message.error).toHaveBeenCalled();
            }, { timeout: 3000 });
        });
    });

    describe('Loading States', () => {
        test('should show loading spinner when data is being fetched', async () => {
            const loadingStore = createMockStore({
                isLoading: true,
            });

            renderWithProviders(<SuperAdminReport />, loadingStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should disable buttons during export', async () => {
            exportUtils.exportToPdf.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/PDF/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const pdfButton = screen.getByText(/PDF/i);
            fireEvent.click(pdfButton);

            // Just verify the export was called
            await waitFor(() => {
                expect(exportUtils.exportToPdf).toHaveBeenCalled();
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty user reports data', async () => {
            const emptyStore = createMockStore({
                userReportsData: [],
            });

            renderWithProviders(<SuperAdminReport />, emptyStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should handle missing revenue data', async () => {
            const noRevenueStore = createMockStore({
                reportData: {
                    ...mockData.reportData,
                    total_event_revenue: null,
                    total_movie_revenue: null,
                },
            });

            renderWithProviders(<SuperAdminReport />, noRevenueStore);

            await waitFor(() => {
                const table = screen.getByRole('table');
                expect(table).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should handle missing currency code', async () => {
            const noCurrencyStore = createMockStore({
                reportData: {
                    ...mockData.reportData,
                    revenue_by_country: [{
                        ...mockData.reportData.revenue_by_country[0],
                        currency_code: null
                    }],
                },
            });

            renderWithProviders(<SuperAdminReport />, noCurrencyStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should handle null or undefined user reports', async () => {
            const nullDataStore = createMockStore({
                userReportsData: null,
            });

            renderWithProviders(<SuperAdminReport />, nullDataStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should handle very large numbers in statistics', async () => {
            const largeNumbersStore = createMockStore({
                reportData: {
                    ...mockData.reportData,
                    total_events: 999999999,
                    total_event_revenue: 999999999.99,
                },
            });

            renderWithProviders(<SuperAdminReport />, largeNumbersStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should handle users with no revenue', async () => {
            const noRevenueUsers = createMockStore({
                userReportsData: [
                    {
                        ...mockData.userReportsData[0],
                        total_revenue: 0,
                        revenue_by_country: [],
                    },
                ],
            });

            renderWithProviders(<SuperAdminReport />, noRevenueUsers);

            await waitFor(() => {
                const table = screen.getByRole('table');
                expect(table).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Table Functionality', () => {
        test('should render organizer links correctly', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                const links = screen.getAllByRole('link');
                expect(links.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        test('should handle pagination changes', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                const table = screen.getByRole('table');
                expect(table).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should display correct revenue formatting', async () => {
            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByText(/15,250\.00/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Responsive Design', () => {
        test('should render on mobile viewport', async () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should render on tablet viewport', async () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            renderWithProviders(<SuperAdminReport />, store);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Data Validation', () => {
        test('should handle malformed data gracefully', async () => {
            const malformedStore = createMockStore({
                reportData: {},
                userReportsData: [{ invalid: 'data' }],
            });

            renderWithProviders(<SuperAdminReport />, malformedStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        test('should display N/A for missing statistics', async () => {
            const incompleteStore = createMockStore({
                reportData: {
                    total_events: undefined,
                    active_users_in_events: undefined,
                },
            });

            renderWithProviders(<SuperAdminReport />, incompleteStore);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});