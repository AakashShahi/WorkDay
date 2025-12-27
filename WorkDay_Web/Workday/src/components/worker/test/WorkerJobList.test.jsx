import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WorkerJobList from "../WorkerJobList";

// =================================================================
// Mocks
// =================================================================

const mockRequestJobMutate = jest.fn();

jest.mock("../../../hooks/worker/useWorkerJob", () => ({
    useWorkerPublicJob: jest.fn(),
    useRequestPublicJob: () => ({
        mutate: mockRequestJobMutate,
        isLoading: false,
    }),
}));

jest.mock("../../../hooks/worker/useWorkerProfession", () => ({
    useWorkerProfession: jest.fn(),
}));

jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
    },
}));

// =================================================================
// Test Setup
// =================================================================

const { useWorkerPublicJob } = require("../../../hooks/worker/useWorkerJob");
const { useWorkerProfession } = require("../../../hooks/worker/useWorkerProfession");

const mockJobs = [
    { _id: "job1", description: "Fix leaky faucet", location: "Gokarneshwor", category: { category: "Plumbing" }, postedBy: { name: "Alice", phone: "111-222-3333" } },
    { _id: "job2", description: "Install new wiring", location: "Kathmandu", category: { category: "Electrical" }, postedBy: { name: "Bob", phone: "444-555-6666" } },
];

const mockProfessions = [
    { _id: "prof1", name: "Plumbing" },
    { _id: "prof2", name: "Electrical" },
];

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

// =================================================================
// Test Suite
// =================================================================

describe("WorkerJobList", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementations for hooks
        useWorkerPublicJob.mockReturnValue({
            publicJobs: [],
            pagination: { page: 1, totalPages: 1 },
            isLoading: true,
            isError: false,
        });
        useWorkerProfession.mockReturnValue({
            professions: mockProfessions,
            isLoading: false,
        });
    });

    // --- Render States ---
    test("shows loading state correctly", () => {
        renderWithProviders(<WorkerJobList />);
        expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
    });

    test("shows error message on data fetching failure", () => {
        useWorkerPublicJob.mockReturnValue({ ...useWorkerPublicJob(), isLoading: false, isError: true });
        renderWithProviders(<WorkerJobList />);
        expect(screen.getByText("Failed to load jobs.")).toBeInTheDocument();
    });

    test("shows 'no jobs found' when list is empty", () => {
        useWorkerPublicJob.mockReturnValue({ publicJobs: [], isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<WorkerJobList />);
        expect(screen.getByText("No jobs found.")).toBeInTheDocument();
    });

    test("renders job cards when data is loaded", () => {
        useWorkerPublicJob.mockReturnValue({ publicJobs: mockJobs, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<WorkerJobList />);
        expect(screen.getByText("Fix leaky faucet")).toBeInTheDocument();
        expect(screen.getByText("Install new wiring")).toBeInTheDocument();
    });

    // --- Filtering ---
    test("allows user to fill filter form and submit", async () => {
        useWorkerPublicJob.mockReturnValue({ publicJobs: mockJobs, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<WorkerJobList />);

        const searchInput = screen.getByPlaceholderText("Search by description...");
        const locationInput = screen.getByPlaceholderText("e.g. Nayapati");
        const categorySelect = screen.getByRole("combobox", { name: /Category/i });
        const submitButton = screen.getByRole("button", { name: /Search/i });

        await userEvent.type(searchInput, "faucet");
        await userEvent.type(locationInput, "Gokarneshwor");
        await userEvent.selectOptions(categorySelect, "Plumbing");

        fireEvent.click(submitButton);

        // The hook is called again with the new query parameters.
        // We can check the arguments of the last call to the mock.
        await waitFor(() => {
            expect(useWorkerPublicJob).toHaveBeenLastCalledWith(expect.objectContaining({
                search: "faucet",
                location: "Gokarneshwor",
                category: "Plumbing",
            }));
        });
    });

    // --- Job Request Modal Flow ---
    test("opens job details modal, confirms request, and calls mutation", async () => {
        useWorkerPublicJob.mockReturnValue({ publicJobs: mockJobs, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        mockRequestJobMutate.mockImplementation((jobId, { onSuccess }) => onSuccess());
        renderWithProviders(<WorkerJobList />);

        const requestButton = screen.getByRole("button", { name: /Request job: Fix leaky faucet/i });
        fireEvent.click(requestButton);

        // Modal appears with correct content
        const modal = await screen.findByRole("dialog");
        expect(modal).toBeInTheDocument();
        expect(within(modal).getByRole("heading", { name: /Fix leaky faucet/i })).toBeInTheDocument();
        expect(within(modal).getByText("Alice")).toBeInTheDocument();

        // Confirm request
        const confirmButton = within(modal).getByRole("button", { name: /Request Job/i });
        fireEvent.click(confirmButton);

        // Check mutation and that modal closes
        expect(mockRequestJobMutate).toHaveBeenCalledTimes(1);
        expect(mockRequestJobMutate).toHaveBeenCalledWith("job1", expect.any(Object));
        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });

    test("opens modal and closes it with the cancel button", async () => {
        useWorkerPublicJob.mockReturnValue({ publicJobs: mockJobs, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<WorkerJobList />);

        const requestButton = screen.getByRole("button", { name: /Request job: Fix leaky faucet/i });
        fireEvent.click(requestButton);

        const modal = await screen.findByRole("dialog");
        const cancelButton = within(modal).getByRole("button", { name: /Cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
        expect(mockRequestJobMutate).not.toHaveBeenCalled();
    });

    // --- Pagination ---
    test("handles pagination correctly", async () => {
        useWorkerPublicJob.mockImplementation(({ page }) => ({
            publicJobs: mockJobs,
            isLoading: false,
            pagination: { page, totalPages: 3 },
        }));
        renderWithProviders(<WorkerJobList />);

        const nextButton = screen.getByRole("button", { name: /Next/i });
        const prevButton = screen.getByRole("button", { name: /Prev/i });

        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
        expect(prevButton).toBeDisabled();

        fireEvent.click(nextButton);
        expect(await screen.findByText("Page 2 of 3")).toBeInTheDocument();
        expect(prevButton).toBeEnabled();
    });
});