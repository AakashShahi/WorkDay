import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminJobManagement from "../AdminJobManagement";

// Mock the custom hooks to control their output in tests
const mockDeleteJob = jest.fn();
const mockDeleteAllJobs = jest.fn();

jest.mock("../../../hooks/admin/useAdminJob", () => ({
    useAdminJob: jest.fn(),
    useDeleteJob: () => ({ mutate: mockDeleteJob, isLoading: false }),
    useDeleteAllJobs: () => ({ mutate: mockDeleteAllJobs, isLoading: false }),
}));

// Mock utility functions
jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

// Mock framer-motion to remove animations from tests
jest.mock("framer-motion", () => ({
    ...jest.requireActual("framer-motion"),
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
    },
}));

// A helper to wrap the component in QueryClientProvider
const renderWithProviders = (ui) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries for tests
            },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

// Import the mocked hook to control its return value in each test
const { useAdminJob } = require("../../../hooks/admin/useAdminJob");

// Mock job data for testing
const mockJobs = [
    {
        _id: "job1",
        description: "Fix leaky faucet",
        status: "open",
        location: "Kitchen",
        date: "2025-07-28",
        time: "10:00 AM",
        createdAt: "2025-07-27T10:00:00.000Z",
        postedBy: { name: "John Doe", phone: "123-456-7890" },
        category: { category: "Plumbing", icon: "plumbing.png" },
    },
    {
        _id: "job2",
        description: "Install new ceiling fan",
        status: "done",
        location: "Living Room",
        date: "2025-07-26",
        time: "02:00 PM",
        createdAt: "2025-07-25T14:00:00.000Z",
        postedBy: { name: "Jane Smith", phone: "098-765-4321" },
        category: { category: "Electrical", icon: "electrical.png" },
    },
];

describe("AdminJobManagement", () => {
    // ====================================================================
    // THIS IS THE FIX: Reset all mocks before each test runs.
    // ====================================================================
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("shows loading state initially", () => {
        useAdminJob.mockReturnValue({ jobs: [], isLoading: true, isError: false });
        renderWithProviders(<AdminJobManagement />);
        expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
    });

    test("shows error message on data fetching failure", () => {
        useAdminJob.mockReturnValue({ jobs: [], isLoading: false, isError: true });
        renderWithProviders(<AdminJobManagement />);
        expect(screen.getByText("Failed to load jobs.")).toBeInTheDocument();
    });

    test("shows 'no jobs found' message when there are no jobs", () => {
        useAdminJob.mockReturnValue({ jobs: [], isLoading: false, isError: false });
        renderWithProviders(<AdminJobManagement />);
        expect(screen.getByText(/No jobs found/)).toBeInTheDocument();
    });

    test("renders job cards when data is loaded successfully", () => {
        useAdminJob.mockReturnValue({ jobs: mockJobs, isLoading: false, isError: false });
        renderWithProviders(<AdminJobManagement />);
        expect(screen.getByText("Fix leaky faucet")).toBeInTheDocument();
        expect(screen.getByText("Install new ceiling fan")).toBeInTheDocument();
        expect(screen.getByText("Manage Jobs (2)")).toBeInTheDocument();
    });

    test("filters jobs based on status selection", async () => {
        useAdminJob.mockReturnValue({ jobs: mockJobs, isLoading: false, isError: false });
        renderWithProviders(<AdminJobManagement />);

        expect(screen.getByText("Fix leaky faucet")).toBeInTheDocument();
        expect(screen.getByText("Install new ceiling fan")).toBeInTheDocument();

        const filterSelect = screen.getByRole("combobox");
        fireEvent.change(filterSelect, { target: { value: "open" } });

        await waitFor(() => {
            expect(screen.getByText("Manage Jobs (1)")).toBeInTheDocument();
            expect(screen.getByText("Fix leaky faucet")).toBeInTheDocument();
            expect(screen.queryByText("Install new ceiling fan")).not.toBeInTheDocument();
        });
    });

    test("opens delete confirmation modal, confirms deletion, and calls deleteJob", async () => {
        useAdminJob.mockReturnValue({ jobs: mockJobs, isLoading: false, isError: false });
        mockDeleteJob.mockImplementation((id, { onSuccess }) => {
            onSuccess();
        });

        renderWithProviders(<AdminJobManagement />);

        const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
        fireEvent.click(deleteButtons[0]);

        expect(
            await screen.findByRole("heading", { name: /Confirm Delete/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete the job: "Fix leaky faucet"?/)).toBeInTheDocument();

        const confirmButton = screen.getByRole("button", { name: "Yes, Delete" });
        fireEvent.click(confirmButton);

        expect(mockDeleteJob).toHaveBeenCalledTimes(1);
        expect(mockDeleteJob).toHaveBeenCalledWith("job1", expect.any(Object));

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /Confirm Delete/i })).not.toBeInTheDocument();
        });
    });

    test("opens delete all confirmation modal and calls deleteAllJobs", async () => {
        useAdminJob.mockReturnValue({ jobs: mockJobs, isLoading: false, isError: false });
        renderWithProviders(<AdminJobManagement />);

        const deleteAllButton = screen.getByRole("button", { name: "Delete All Jobs" });
        fireEvent.click(deleteAllButton);

        expect(
            await screen.findByRole("heading", { name: /Delete All Jobs/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete all jobs?/)).toBeInTheDocument();

        const confirmButton = screen.getByRole("button", { name: "Yes, Delete" });
        fireEvent.click(confirmButton);

        expect(mockDeleteAllJobs).toHaveBeenCalledTimes(1);
    });

    test("cancels deletion when 'Cancel' is clicked in the modal", async () => {
        useAdminJob.mockReturnValue({ jobs: mockJobs, isLoading: false, isError: false });
        renderWithProviders(<AdminJobManagement />);

        const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
        fireEvent.click(deleteButtons[0]);

        expect(
            await screen.findByRole("heading", { name: /Confirm Delete/i })
        ).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /Confirm Delete/i })).not.toBeInTheDocument();
        });

        // This will now pass because the mock's history was cleared by beforeEach
        expect(mockDeleteJob).not.toHaveBeenCalled();
    });
});