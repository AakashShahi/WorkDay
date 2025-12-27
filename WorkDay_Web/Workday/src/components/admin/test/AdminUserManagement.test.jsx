import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUserManagement from "../AdminUserManagement";

// =================================================================
// Mocks
// =================================================================

// Mock the hooks from useAdminUser
const mockSetPageNumber = jest.fn();
const mockSetSearch = jest.fn();
const mockDeleteUser = jest.fn();
const mockCreateUser = jest.fn();

jest.mock("../../../hooks/admin/useAdminUser", () => ({
    useAdminUsers: jest.fn(),
    useDeleteAdminUser: () => ({ mutate: mockDeleteUser }),
    useCreateAdminUser: () => ({ mutate: mockCreateUser }),
}));

// Mock the useAdminProfession hook
jest.mock("../../../hooks/admin/useAdminProfession", () => ({
    useAdminProfession: jest.fn(),
}));

// Mock the child modal components to test that they receive the correct props
jest.mock("../modal/AdminAddUserModal", () => ({
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? <div data-testid="add-user-modal">Add Modal</div> : null),
}));

jest.mock("../modal/AdminDeleteUserModal", () => ({
    __esModule: true,
    default: ({ isOpen, user }) => (
        isOpen ? <div data-testid="delete-user-modal">Deleting {user?.username}</div> : null
    ),
}));

// Mock other utilities
jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

// =================================================================
// Test Setup
// =================================================================

const { useAdminUsers } = require("../../../hooks/admin/useAdminUser");
const { useAdminProfession } = require("../../../hooks/admin/useAdminProfession");

const mockUsers = [
    { _id: "1", username: "Alice", email: "alice@test.com", role: "admin", createdAt: new Date().toISOString() },
    { _id: "2", username: "Bob", email: "bob@test.com", role: "worker", createdAt: new Date().toISOString(), profession: { category: "Plumbing" } },
    { _id: "3", username: "Charlie", email: "charlie@test.com", role: "customer", createdAt: new Date().toISOString(), location: "City Hall" },
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

describe("AdminUserManagement", () => {
    beforeEach(() => {
        // Reset all mocks and mock hook return values before each test
        jest.clearAllMocks();
        useAdminUsers.mockReturnValue({
            users: [],
            pagination: { page: 1, totalPages: 1 },
            setPageNumber: mockSetPageNumber,
            setSearch: mockSetSearch,
            isPending: true,
            canPreviousPage: false,
            canNextPage: false,
        });
        useAdminProfession.mockReturnValue({
            professions: [],
            isLoading: false,
        });
    });

    // --- Render States ---
    test("shows loading state correctly", () => {
        renderWithProviders(<AdminUserManagement />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("shows 'no users found' when data is loaded but the list is empty", () => {
        useAdminUsers.mockReturnValue({
            ...useAdminUsers(),
            users: [],
            isPending: false,
        });
        renderWithProviders(<AdminUserManagement />);
        expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    test("renders user cards when data is successfully loaded", () => {
        useAdminUsers.mockReturnValue({
            ...useAdminUsers(),
            users: mockUsers,
            isPending: false,
        });
        renderWithProviders(<AdminUserManagement />);
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    // --- User Interactions ---
    test("calls setSearch when user types in the search input", () => {
        useAdminUsers.mockReturnValue({
            ...useAdminUsers(),
            isPending: false,
        });
        renderWithProviders(<AdminUserManagement />);
        const searchInput = screen.getByPlaceholderText("Search users...");
        fireEvent.change(searchInput, { target: { value: "test search" } });

        expect(mockSetSearch).toHaveBeenCalledWith("test search");
        expect(mockSetPageNumber).toHaveBeenCalledWith(1);
    });

    test("filters users by role when dropdown is changed", async () => {
        useAdminUsers.mockReturnValue({
            ...useAdminUsers(),
            users: mockUsers,
            isPending: false,
        });
        renderWithProviders(<AdminUserManagement />);

        // Initially all users are present
        expect(screen.getByText("Alice")).toBeInTheDocument(); // admin
        expect(screen.getByText("Bob")).toBeInTheDocument();   // worker

        // Filter by worker
        const roleFilter = screen.getByRole("combobox");
        fireEvent.change(roleFilter, { target: { value: "worker" } });

        await waitFor(() => {
            // Only worker "Bob" should be visible
            expect(screen.queryByText("Alice")).not.toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
        });
    });

    // --- Pagination ---
    test("calls setPageNumber for next and previous pages", () => {
        useAdminUsers.mockReturnValue({
            users: mockUsers,
            pagination: { page: 2, totalPages: 3 },
            setPageNumber: mockSetPageNumber,
            isPending: false,
            canPreviousPage: true,
            canNextPage: true,
        });
        renderWithProviders(<AdminUserManagement />);

        const prevButton = screen.getByRole("button", { name: /Previous/i });
        const nextButton = screen.getByRole("button", { name: /Next/i });

        fireEvent.click(nextButton);
        expect(mockSetPageNumber).toHaveBeenCalled();

        fireEvent.click(prevButton);
        expect(mockSetPageNumber).toHaveBeenCalled();
    });

    test("disables pagination buttons correctly", () => {
        useAdminUsers.mockReturnValue({
            users: mockUsers,
            pagination: { page: 1, totalPages: 1 },
            isPending: false,
            canPreviousPage: false,
            canNextPage: false,
        });
        renderWithProviders(<AdminUserManagement />);

        expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();
    });

    // --- Modals ---
    test("opens the Add User modal when 'Add User' button is clicked", () => {
        useAdminUsers.mockReturnValue({ ...useAdminUsers(), isPending: false });
        renderWithProviders(<AdminUserManagement />);

        expect(screen.queryByTestId("add-user-modal")).not.toBeInTheDocument();

        const addButton = screen.getByRole("button", { name: /Add User/i });
        fireEvent.click(addButton);

        expect(screen.getByTestId("add-user-modal")).toBeInTheDocument();
    });

    test("opens the Delete User modal with the correct user when delete is clicked", () => {
        // CORRECTED MOCK: Added the missing 'pagination' object and other properties
        useAdminUsers.mockReturnValue({
            users: mockUsers,
            pagination: { page: 1, totalPages: 1 },
            setPageNumber: mockSetPageNumber,
            setSearch: mockSetSearch,
            isPending: false,
            canPreviousPage: false,
            canNextPage: false,
        });

        renderWithProviders(<AdminUserManagement />);

        expect(screen.queryByTestId("delete-user-modal")).not.toBeInTheDocument();

        // Find the "Bob" card and its delete button
        const userCard = screen.getByText("Bob").closest(".group");
        const deleteButton = within(userCard).getByTitle("Delete user");
        fireEvent.click(deleteButton);

        const deleteModal = screen.getByTestId("delete-user-modal");
        expect(deleteModal).toBeInTheDocument();
        expect(deleteModal).toHaveTextContent("Deleting Bob");
    });
});