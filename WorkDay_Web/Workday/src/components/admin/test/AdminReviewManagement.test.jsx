import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminReviewManagement from "../AdminReviewManagement";

// =================================================================
// Mocks
// =================================================================

// Create mock functions for the hook mutations
const mockDeleteMutate = jest.fn();

// Mock the entire hooks module
jest.mock("../../../hooks/admin/useAdminReview", () => ({
    useGetAllReviews: jest.fn(),
    useDeleteReview: () => ({
        mutate: mockDeleteMutate,
    }),
}));

// Import the mocked hooks to control their return values in tests
const { useGetAllReviews } = require("../../../hooks/admin/useAdminReview");

// =================================================================
// Test Setup
// =================================================================

const mockReviews = [
    {
        _id: "review1",
        comment: "Excellent work, very professional.",
        rating: 5,
        createdAt: "2025-07-27T10:00:00.000Z",
        customerId: { name: "Customer Alice" },
        workerId: { name: "Worker Bob" },
        jobId: { description: "Fixing the main pipeline", location: "Downtown", status: "done" },
    },
    {
        _id: "review2",
        comment: "Was okay, but a bit late.",
        rating: 3.5,
        createdAt: "2025-07-26T14:00:00.000Z",
        customerId: { name: "Customer Charles" },
        workerId: { name: "Worker Dave" },
        jobId: { description: "Electrical wiring check", location: "Uptown", status: "failed" },
    },
];

// A helper to wrap the component in the necessary provider
const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

// =================================================================
// Test Suite
// =================================================================

describe("AdminReviewManagement", () => {
    beforeEach(() => {
        // Reset mocks before each test to ensure test isolation
        jest.clearAllMocks();
    });

    // --- Render States ---
    test("shows loading state correctly", () => {
        useGetAllReviews.mockReturnValue({
            reviews: [],
            pagination: { page: 1, totalPages: 1 },
            isLoading: true,
        });
        renderWithProviders(<AdminReviewManagement />);
        expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
    });

    test("shows 'no reviews found' message when the list is empty", () => {
        useGetAllReviews.mockReturnValue({
            reviews: [],
            pagination: { page: 1, totalPages: 1 },
            isLoading: false,
        });
        renderWithProviders(<AdminReviewManagement />);
        expect(screen.getByText("No reviews found.")).toBeInTheDocument();
    });

    test("renders a list of reviews when data is loaded", () => {
        useGetAllReviews.mockReturnValue({
            reviews: mockReviews,
            pagination: { page: 1, totalPages: 1 },
            isLoading: false,
        });
        renderWithProviders(<AdminReviewManagement />);
        expect(screen.getByText("Excellent work, very professional.")).toBeInTheDocument();
        expect(screen.getByText("Was okay, but a bit late.")).toBeInTheDocument();
    });

    // --- User Interactions ---
    test("updates search input value when user types", () => {
        useGetAllReviews.mockReturnValue({ reviews: [], isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<AdminReviewManagement />);
        const searchInput = screen.getByPlaceholderText(/Search by comment or worker name/i);
        fireEvent.change(searchInput, { target: { value: "professional" } });
        expect(searchInput.value).toBe("professional");
    });

    // --- Pagination ---
    test("handles pagination correctly", async () => {
        // Make the mock respond dynamically to the page prop
        useGetAllReviews.mockImplementation(({ page }) => ({
            reviews: mockReviews,
            pagination: { page: page, totalPages: 3 },
            isLoading: false,
        }));

        renderWithProviders(<AdminReviewManagement />);

        const nextButton = screen.getByRole("button", { name: /Next/i });
        const prevButton = screen.getByRole("button", { name: /Previous/i });

        // Initial state (Page 1 of 3)
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();

        // Go to Page 2
        fireEvent.click(nextButton);
        expect(await screen.findByText("Page 2 of 3")).toBeInTheDocument();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();

        // Go to Page 3
        fireEvent.click(nextButton);
        expect(await screen.findByText("Page 3 of 3")).toBeInTheDocument();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeDisabled();
    });

    // --- Deletion Flow ---
    test("opens delete modal, confirms, and calls delete mutation", async () => {
        useGetAllReviews.mockReturnValue({
            reviews: mockReviews,
            pagination: { page: 1, totalPages: 1 },
            isLoading: false,
        });
        renderWithProviders(<AdminReviewManagement />);

        // Find the delete button for the first review
        const reviewCard = screen.getByText("Excellent work, very professional.").closest("div.bg-white");
        const deleteButtonIcon = within(reviewCard).getByTitle("Delete Review");
        fireEvent.click(deleteButtonIcon);

        // The modal should appear
        const heading = await screen.findByRole("heading", { name: /Confirm Deletion/i });
        expect(heading).toBeInTheDocument();

        // Check if the modal contains the correct user names
        const modal = heading.closest("div.animate-scaleFadeIn");
        expect(within(modal).getByText("Customer Alice")).toBeInTheDocument();
        expect(within(modal).getByText("Worker Bob")).toBeInTheDocument();

        // Click the final confirmation button
        const confirmDeleteButton = within(modal).getByRole("button", { name: /Delete/i });
        fireEvent.click(confirmDeleteButton);

        // Verify the mutation was called correctly
        expect(mockDeleteMutate).toHaveBeenCalledTimes(1);
        expect(mockDeleteMutate).toHaveBeenCalledWith("review1");

        // The modal should close after confirmation
        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /Confirm Deletion/i })).not.toBeInTheDocument();
        });
    });

    test("opens delete modal and cancels the deletion", async () => {
        useGetAllReviews.mockReturnValue({
            reviews: mockReviews,
            pagination: { page: 1, totalPages: 1 },
            isLoading: false,
        });
        renderWithProviders(<AdminReviewManagement />);

        // Open the modal
        const reviewCard = screen.getByText("Excellent work, very professional.").closest("div.bg-white");
        const deleteButtonIcon = within(reviewCard).getByTitle("Delete Review");
        fireEvent.click(deleteButtonIcon);

        const heading = await screen.findByRole("heading", { name: /Confirm Deletion/i });
        const modal = heading.closest("div.animate-scaleFadeIn");

        // Click the cancel button
        const cancelButton = within(modal).getByRole("button", { name: /Cancel/i });
        fireEvent.click(cancelButton);

        // The mutation should NOT be called
        expect(mockDeleteMutate).not.toHaveBeenCalled();

        // The modal should close
        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /Confirm Deletion/i })).not.toBeInTheDocument();
        });
    });
});