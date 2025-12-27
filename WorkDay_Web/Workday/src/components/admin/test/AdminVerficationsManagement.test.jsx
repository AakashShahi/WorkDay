import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminVerificationsManagement from "../AdminVerificationsManagement";

// =================================================================
// Mocks
// =================================================================

const mockAcceptMutate = jest.fn();
const mockRejectMutate = jest.fn();

// Mock the entire hooks module for verifications
jest.mock("../../../hooks/admin/useAdminVerification", () => ({
    useGetVerificationRequests: jest.fn(),
    useAcceptVerification: () => ({ mutate: mockAcceptMutate, isLoading: false }),
    useRejectVerification: () => ({ mutate: mockRejectMutate, isLoading: false }),
}));

// Mock other dependencies
jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

jest.mock("react-icons/fa", () => ({
    FaCheckCircle: () => "AcceptIcon",
    FaTimesCircle: () => "RejectIcon",
    FaEnvelope: () => "EmailIcon",
    FaPhone: () => "PhoneIcon",
    FaUser: () => "UserIcon",
    FaTimes: () => "CloseIcon",
}));

// =================================================================
// Test Setup
// =================================================================

// Import the mocked hook to control its return value in tests
const { useGetVerificationRequests } = require("../../../hooks/admin/useAdminVerification");

const mockVerifications = [
    {
        _id: "worker1",
        name: "Alice Worker",
        email: "alice@work.com",
        phone: "111-222-3333",
        role: "worker",
        profilePic: "alice.jpg",
        certificateUrl: "alice_cert.pdf",
    },
    {
        _id: "worker2",
        name: "Bob Builder",
        email: "bob@build.com",
        phone: "444-555-6666",
        role: "worker",
        profilePic: "bob.jpg",
        certificateUrl: "bob_cert.pdf",
    },
];

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

// =================================================================
// Test Suite
// =================================================================

describe("AdminVerificationsManagement", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Render States ---
    test("shows loading state correctly", () => {
        useGetVerificationRequests.mockReturnValue({
            verifications: [],
            isLoading: true,
            pagination: { page: 1, totalPages: 1 },
        });
        renderWithProviders(<AdminVerificationsManagement />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("shows 'no requests' message when list is empty", () => {
        useGetVerificationRequests.mockReturnValue({
            verifications: [],
            isLoading: false,
            pagination: { page: 1, totalPages: 1 },
        });
        renderWithProviders(<AdminVerificationsManagement />);
        expect(screen.getByText("No verification requests found.")).toBeInTheDocument();
    });

    // CORRECTED TEST
    test("renders verification requests when data is loaded", () => {
        useGetVerificationRequests.mockReturnValue({
            verifications: mockVerifications,
            isLoading: false,
            pagination: { page: 1, totalPages: 1 },
        });
        renderWithProviders(<AdminVerificationsManagement />);
        // Use regular expressions to find text next to other elements
        expect(screen.getByText(/Alice Worker/)).toBeInTheDocument();
        expect(screen.getByText(/Bob Builder/)).toBeInTheDocument();
    });

    // --- Core Actions ---
    test("calls accept mutation when 'Accept' button is clicked", () => {
        useGetVerificationRequests.mockReturnValue({ verifications: mockVerifications, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<AdminVerificationsManagement />);
        const acceptButton = screen.getAllByRole("button", { name: /Accept/i })[0];
        fireEvent.click(acceptButton);
        expect(mockAcceptMutate).toHaveBeenCalledTimes(1);
        expect(mockAcceptMutate).toHaveBeenCalledWith("worker1");
    });

    test("calls reject mutation when 'Reject' button is clicked", () => {
        useGetVerificationRequests.mockReturnValue({ verifications: mockVerifications, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<AdminVerificationsManagement />);
        const rejectButton = screen.getAllByRole("button", { name: /Reject/i })[0];
        fireEvent.click(rejectButton);
        expect(mockRejectMutate).toHaveBeenCalledTimes(1);
        expect(mockRejectMutate).toHaveBeenCalledWith("worker1");
    });


    test("does NOT open details modal when accept/reject buttons are clicked", () => {
        useGetVerificationRequests.mockReturnValue({ verifications: mockVerifications, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<AdminVerificationsManagement />);
        const acceptButton = screen.getAllByRole("button", { name: /Accept/i })[0];
        fireEvent.click(acceptButton);
        expect(screen.queryByRole("heading", { name: /Alice Worker/i })).not.toBeInTheDocument();
    });

    // CORRECTED TEST
    test("closes the details modal when the close button is clicked", async () => {
        useGetVerificationRequests.mockReturnValue({ verifications: mockVerifications, isLoading: false, pagination: { page: 1, totalPages: 1 } });
        renderWithProviders(<AdminVerificationsManagement />);

        // Use a regular expression to open the modal
        const requestItem = screen.getByText(/Alice Worker/).closest("div.cursor-pointer");
        fireEvent.click(requestItem);
        expect(await screen.findByRole("heading", { name: /Alice Worker/i })).toBeInTheDocument();

        const closeButton = screen.getByTitle("Close");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /Alice Worker/i })).not.toBeInTheDocument();
        });
    });

    // --- Pagination ---
    test("handles pagination correctly", async () => {
        useGetVerificationRequests.mockImplementation(({ page }) => ({
            verifications: mockVerifications,
            isLoading: false,
            pagination: { page, totalPages: 3 },
        }));

        renderWithProviders(<AdminVerificationsManagement />);
        const nextButton = screen.getByRole("button", { name: /Next/i });
        const prevButton = screen.getByRole("button", { name: /Previous/i });

        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
        expect(prevButton).toBeDisabled();

        fireEvent.click(nextButton);
        expect(await screen.findByText(/Page 2 of 3/)).toBeInTheDocument();
        expect(prevButton).toBeEnabled();

        fireEvent.click(nextButton);
        expect(await screen.findByText(/Page 3 of 3/)).toBeInTheDocument();
        expect(nextButton).toBeDisabled();
    });
});